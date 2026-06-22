import {Router} from 'express';
import authorize from '../middlewares/auth.middleware.js';
import Subscription from '../models/subscription.model.js';
import {
    createSubscription,
    getUserSubscriptions,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

// All routes below require authentication
subscriptionRouter.get('/user/:id',      authorize, getUserSubscriptions);
subscriptionRouter.post('/',             authorize, createSubscription);
subscriptionRouter.get('/:id',           authorize, getSubscription);
subscriptionRouter.put('/:id',           authorize, updateSubscription);
subscriptionRouter.delete('/:id',        authorize, deleteSubscription);
subscriptionRouter.put('/:id/cancel',    authorize, cancelSubscription);

export default subscriptionRouter;
