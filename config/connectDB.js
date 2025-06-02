import mongoose from 'mongoose';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('DB Connected successfully'))
    .catch((err) => console('Failed to connect to DB:', err));

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB.');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to application termination');
    process.exit(0);
});