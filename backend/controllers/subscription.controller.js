import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        // Trigger workflow in background — non-blocking (QStash may not be running locally)
        workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: { subscriptionId: subscription.id },
            headers: { 'content-type': 'application/json' },
            retries: 0,
        }).catch((err) => {
            console.warn(`⚠️  Workflow trigger skipped: ${err.message}`);
        });

        res.status(201).json({ success: true, data: subscription });
    } catch (e) {
        next(e);
    }
};

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user.id != req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });
        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
};

export const getSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        // Only owner can view
        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to view this subscription');
            error.statusCode = 403;
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (e) {
        next(e);
    }
};

export const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to update this subscription');
            error.statusCode = 403;
            throw error;
        }

        const updated = await Subscription.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updated });
    } catch (e) {
        next(e);
    }
};

export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        // Only owner can delete
        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to delete this subscription');
            error.statusCode = 403;
            throw error;
        }

        await Subscription.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
    } catch (e) {
        next(e);
    }
};

export const cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to cancel this subscription');
            error.statusCode = 403;
            throw error;
        }

        if (subscription.status === 'cancelled') {
            const error = new Error('Subscription is already cancelled');
            error.statusCode = 400;
            throw error;
        }

        const updated = await Subscription.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );

        res.status(200).json({ success: true, data: updated });
    } catch (e) {
        next(e);
    }
};

