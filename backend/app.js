import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { PORT } from './config/env.js';

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjectMiddleware from "./middlewares/arcject.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

// CORS – allow React dev server and production frontend
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true, // Allow cookies (JWT)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// express have build in middlewares
app.use(express.json());  // this allows our app to handle json data sent in request or API
app.use(express.urlencoded({extended: false})); //this helps us to process the form data sent via html forms in a simple format.
app.use(cookieParser());
app.use(arcjectMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use(errorMiddleware);

app.get('/',(req, res) =>{
    res.send('Welcome to the Subsciption Tracker API!');
});

app.listen(PORT,async () =>  {
    console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);

    await connectToDatabase();
});

export default app;