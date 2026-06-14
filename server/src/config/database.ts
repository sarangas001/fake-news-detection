import mongoose from 'mongoose';


const connectDB = async () : Promise<void> => {
    try {
        const mongiUri = process.env.MONGODB_URI;
        if (!mongiUri) 
            throw new Error(`MONGO_URI is not defined in environment variables`);

        await mongoose.connect(mongiUri);
        console.log('MongoDB connected successfully');
    }
    catch (err) {
        console.error(`Error connecting to MongoDB:`, err);
        process.exit(1);
    }
};

export default connectDB;