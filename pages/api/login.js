// pages/api/login.js
import dbConnect from '../../utils/dbConnect';
import Admin from '../../models/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dbConnect();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, password } = req.body;

  try {
    const adminPassword = process.env.NEXT_PUBLIC_PASSWORD;
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      const passwordMatch = await bcrypt.compare(password, existingAdmin.password);
      if (passwordMatch){
        const token = jwt.sign({ userId: existingAdmin._id }, process.env.NEXT_PUBLIC_JWT_SECRET, {
          expiresIn: '1h',
        });
        return res.status(200).json({ token, message: 'Logged in successfully.' });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({
          name,
          email,
          password: hashedPassword,
        });

        await admin.save();

        const token = jwt.sign({ userId: admin._id }, process.env.NEXT_PUBLIC_JWT_SECRET, {
          expiresIn: '1h',
        });

        return res.status(200).json({ token, message: 'Logged in successfully and user information saved.' });
      } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
          // Duplicate key error on email field
          return res.status(400).json({ message: 'Email address is already registered.' });
        } else {
          // Other error
          console.error('Error saving admin:', error.message);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      }
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
