import mongoose from 'mongoose';

export async function connectToDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-assistant';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}
