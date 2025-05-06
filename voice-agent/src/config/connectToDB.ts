import mongoose from 'mongoose';

export async function connectToDB() {
  const uri =
    process.env.MONGO_URI ||
    'mongodb+srv://manpreet0855be21:Man3033@cluster0.071o9u0.mongodb.net/ai-assistant';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}
