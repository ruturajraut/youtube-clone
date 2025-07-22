import express from 'express';
const app = express();
import cookieParser from 'cookie-parser';
import cors from 'cors';

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: '16kb'}));  // data coming from form data
app.use(express.urlencoded({limit: '16kb', extended: true})); // data coming from  url encoded form data
app.use(express.static('public')); // data coming from static files

app.use(cookieParser());






export { app };