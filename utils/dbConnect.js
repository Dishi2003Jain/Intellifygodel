import mongoose from 'mongoose';
const MONGODB_URI =  process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  
  let cachedConnection = null;
  
  export default async function dbConnect() {
    if (cachedConnection) {
      return cachedConnection;
    }
  
    if (!mongoose.connections[0]?.readyState) {
      await mongoose.connect(MONGODB_URI);
    }
  
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }