import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true,
        minLength: 2,
        maxLength: 100,
    }, 
    price: {
        type: Number,
        required: [true, 'Subscription price is required'],
        min: [0, 'Price must be greater than 0'],
        max: [1000, 'Price must be less than 1000']
    },
    currency: {
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'INR'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
    }, 
    category: {
        type: String,
        enum: ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other'],
        required: true
    },
    paymentMethod:{
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active'
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            // Allow today's date regardless of timezone — compare date only, not time
            validator: (value) => {
                const today = new Date();
                today.setHours(23, 59, 59, 999); // end of today
                return new Date(value) <= today;
            },
            message: 'Start date must not be in the future'
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            // Bug fix: was 'new this.startDate' (invalid) — now correctly 'this.startDate'
            validator: function (value) {
                return !this.startDate || value > this.startDate;
            },
            message: 'Renewal date must be after start date'
        }
    },
    // Email notification tracking
    lastEmailSentAt: {
        type: Date,
        default: null,
    },
    emailSentCount: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }
}, { timestamps: true });


// Auto-calculate renewal date if missing or if frequency/startDate changed
subscriptionSchema.pre('save', function(next) {
    if (!this.renewalDate || this.isModified('startDate') || this.isModified('frequency')) {
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        // Using millisecond arithmetic is timezone-safe and accurate.
        const renewalDays = {
            daily:   1,
            weekly:  7,
            monthly: 30,
            yearly:  365
        };

        const days = renewalDays[this.frequency] || 30;
        this.renewalDate = new Date(new Date(this.startDate).getTime() + days * MS_PER_DAY);
    }

    // Auto-expire if renewal date has already passed
    if (this.renewalDate < new Date()) {
        this.status = 'expired';
    } else if (this.status === 'expired') {
        // If it was expired but the new renewal date is in the future, reactivate it
        this.status = 'active';
    }

    next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;