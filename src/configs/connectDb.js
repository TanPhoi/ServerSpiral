const { mongoose } = require('mongoose');

require('dotenv').config();

const dbUrL = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.drn7m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(dbUrL);
    console.log('Connect to mongo db successfully');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
