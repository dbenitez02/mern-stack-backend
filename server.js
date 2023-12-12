import 'express-async-errors';
import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';

// Routers
import jobRouter from './routes/jobRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';

// Middleware
import errorHandlerMiddleWare from './middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';

// Public
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
const app = express();

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

// Local storage for media 'public/uploads/'
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, './public')));

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/api/test', (req, res) => {
    res.json({ msg: 'test route'})
});


app.use('/api/jobs', authenticateUser, jobRouter);
app.use('/api/users', authenticateUser, userRouter);
app.use('/api/auth', authRouter);

app.use('*', (req, res) => {
    res.status(404).json({msg: "Not found"});
});

app.use(errorHandlerMiddleWare);

const port = process.env.PORT || 5100

try {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(port, () => {
        console.log(`server runing on PORT ${port}`);
    });
} catch (error) {
    console.log(error);
    process.exit(1);
}
