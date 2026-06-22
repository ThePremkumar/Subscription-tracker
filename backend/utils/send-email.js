import { emailTemplates } from './email-template.js'
import dayjs from 'dayjs'
import transporter, { accountEmail } from '../config/nodemailer.js'
import Subscription from '../models/subscription.model.js'

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) throw new Error('Missing required parameters');

  const template = emailTemplates.find((t) => t.label === type);
  if (!template) throw new Error('Invalid email type');

  const mailInfo = {
    userName:         subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate:      dayjs(subscription.renewalDate).format('MMM D, YYYY'),
    planName:         subscription.name,
    price:            `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
    paymentMethod:    subscription.paymentMethod,
  };

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const mailOptions = {
    from:    accountEmail,
    to:      to,
    subject: subject,
    html:    message,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
        return;
      }

      console.log('Email sent:', info.response);

      // ── Track that the email was sent ──────────────────────────────────
      try {
        await Subscription.findByIdAndUpdate(subscription._id, {
          $set:  { lastEmailSentAt: new Date() },
          $inc:  { emailSentCount: 1 },
        });
        console.log(`Email tracking updated for subscription ${subscription._id}`);
      } catch (trackErr) {
        console.warn('Failed to update email tracking:', trackErr.message);
      }

      resolve(info);
    });
  });
};