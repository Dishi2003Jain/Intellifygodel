import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  }
});

const Admin = mongoose.models.Admin
  ? mongoose.model('Admin')
  : mongoose.model('Admin', adminSchema);

export default Admin;
