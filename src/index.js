import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './.env',
});

connectDB()
.then(() => {
    app.on('error', (err) => {
        console.error('Server error:', err);
    });
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
    console.log('Database connection established successfully.');
}).catch((error) => {
    console.error('Failed to connect to the database:', error);
});
