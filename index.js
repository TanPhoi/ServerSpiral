const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routers/authRouter');
const connectDB = require('./src/configs/connectDb');
const errorMiddlewares = require('./src/middlewares/errorMiddlewares');
const campaignRouter = require('./src/routers/campaignRouter');
const contentRouter = require('./src/routers/contentRouter');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// Cấu hình phục vụ ảnh từ thư mục 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const PORT = 3001;

app.use('/auth', authRouter);
app.use('/campaign', campaignRouter);
app.use('', contentRouter);

connectDB();
app.use(errorMiddlewares);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server starting at http://localhost:${PORT}`);
});
