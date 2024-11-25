const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const asyncHandle = require('express-async-handler');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

let temporaryUsers = {};

const getJsonWebToken = (user) => {
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: '7d',
  });

  return token;
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});

const handleSendMail = async (val) => {
  try {
    await transporter.sendMail(val);

    return 'OK';
  } catch (error) {
    return error;
  }
};

const verification = asyncHandle(async (req, res) => {
  const { email } = req.body;

  const verificationCode = Math.round(100000 + Math.random() * 900000);

  try {
    const data = {
      from: `"Spiral" <${process.env.USERNAME_EMAIL}>`,
      to: email,
      subject: 'Verification email code',
      text: 'Your code to verification email',
      html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your code is: <strong>${verificationCode}</strong></h2>
        <p>Use it to access your account.</p>
        <p>If you didn't request this, simply ignore this message.</p>
        <p>Yours,</p>
        <p><strong>The Spiral Team</strong></p>
      </div>
    `,
    };

    await handleSendMail(data);

    res.status(200).json({
      message: 'Send verification code successfully!!!',
      data: {
        code: verificationCode,
      },
    });
  } catch (error) {
    res.status(401);
    throw new Error('Can not send email');
  }
});

const register = asyncHandle(async (req, res) => {
  const { name, email, phone, category, password } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res.status(401);
    throw new Error('User has already exist!!!');
  }

  // Tạo salt và hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationCode = Math.round(
    100000 + Math.random() * 900000
  ).toString();
  const otpExpires = Date.now() + 5 * 60 * 1000;

  const newUser = new UserModel({
    name,
    email,
    phone,
    category,
    password: hashedPassword,
    otp: verificationCode,
    otpExpires: otpExpires,
    isVerified: false,
  });

  temporaryUsers[email] = newUser;

  try {
    const data = {
      from: `"Spiral" <${process.env.USERNAME_EMAIL}>`,
      to: email,
      subject: 'Verification email code',
      text: 'Your code to verification email',
      html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your code is: <strong>${verificationCode}</strong></h2>
        <p>Use it to access your account.</p>
        <p>If you didn't request this, simply ignore this message.</p>
        <p>Yours,</p>
        <p><strong>The Spiral Team</strong></p>
      </div>
    `,
    };

    await handleSendMail(data);

    res.status(200).json({
      message: 'Register new user successfully',
      data: {
        id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(401);
    throw new Error('Can not send email');
  }
});

const activateUser = asyncHandle(async (req, res) => {
  const { email, otp } = req.body;

  const user = temporaryUsers[email];

  if (!user) {
    res.status(404);
    throw new Error('User not found!');
  }

  if (user.otp === otp) {
    if (Date.now() > user.otpExpires) {
      res.status(400);
      throw new Error('OTP has expired. Please request a new one.');
    }
    user.isVerified = true;
    user.otp = null;

    await UserModel.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      category: user.category,
      password: user.password,
      isVerified: user.isVerified,
    });

    delete temporaryUsers[email];

    res.status(200).json({
      message: 'User activated successfully!',
    });
  } else {
    res.status(400);
    throw new Error('Invalid verification code!');
  }
});

const resendOTP = asyncHandle(async (req, res) => {
  const { email } = req.body;

  // Kiểm tra nếu người dùng tồn tại trong temporaryUsers
  const user = temporaryUsers[email];

  if (!user) {
    res.status(404);
    throw new Error('User not found in temporary list!');
  }

  // Tạo mã OTP mới
  const newOTP = Math.round(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 5 * 60 * 1000;

  user.otp = newOTP; // Cập nhật mã OTP cho người dùng tạm thời
  user.otpExpires = otpExpires;

  try {
    // Cấu hình dữ liệu email
    const data = {
      from: `"Spiral" <${process.env.USERNAME_EMAIL}>`,
      to: email,
      subject: 'Resend Verification Code',
      text: 'Your new OTP code',
      html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your new OTP code is: <strong>${newOTP}</strong></h2>
        <p>Use it to verify your account.</p>
        <p>If you didn't request this, simply ignore this message.</p>
        <p>Yours,</p>
        <p><strong>The Spiral Team</strong></p>
      </div>
      `,
    };

    // Gửi email mã OTP mới
    await handleSendMail(data);

    // Phản hồi thành công
    res.status(200).json({
      message: 'Resend OTP successfully!',
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to resend OTP, please try again.');
  }
});

const login = asyncHandle(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    res.status(403);
    throw new Error('User not found!!!');
  }

  const isMatchPassword = await bcrypt.compare(password, existingUser.password);
  if (!isMatchPassword) {
    res.status(401);
    throw new Error('Email or Password is not correct!');
  }

  res.status(200).json({
    message: 'Login successfully',
    data: {
      id: await getJsonWebToken(existingUser._id),
    },
  });
});

const forgotPassword = asyncHandle(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(403);
    throw new Error('User not found!!!');
  }

  const verificationCode = Math.round(
    100000 + Math.random() * 900000
  ).toString();
  const otpExpires = Date.now() + 5 * 60 * 1000;

  const newUser = new UserModel({
    email: email,
    otp: verificationCode,
    otpExpires: otpExpires,
  });

  temporaryUsers[email] = newUser;

  try {
    const data = {
      from: `"Spiral" <${process.env.USERNAME_EMAIL}>`,
      to: email,
      subject: 'Verification email code',
      text: 'Your code to verification email',
      html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your code is: <strong>${verificationCode}</strong></h2>
        <p>Use it to access your account.</p>
        <p>If you didn't request this, simply ignore this message.</p>
        <p>Yours,</p>
        <p><strong>The Spiral Team</strong></p>
      </div>
    `,
    };

    await handleSendMail(data);

    res.status(200).json({
      message: 'Send verification code successfully',
    });
  } catch (error) {
    res.status(401);
    throw new Error('Can not send email');
  }
});

const verifyOTPResetPassword = asyncHandle(async (req, res) => {
  const { otp, email } = req.body;
  const user = temporaryUsers[email];

  if (!user) {
    res.status(403);
    throw new Error('User not found!!!');
  }

  if (user.otp === otp) {
    if (Date.now() > user.otpExpires) {
      res.status(400);
      throw new Error('OTP has expired. Please request a new one.');
    }
    user.isVerified = true;
    user.otp = null;
    delete temporaryUsers[email];

    res.status(200).json({
      message: 'User activated successfully!',
      data: {
        email: email,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid verification code!');
  }
});

const resetPassword = asyncHandle(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  // Hash mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    message: 'Password reset successfully!',
  });
});

let saveUser = {};

const getUserFromToken = asyncHandle(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header Authorization

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Giải mã token
    const user = await UserModel.findById(decoded.id); // Tìm người dùng từ ID trong token

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    saveUser = user;

    res.status(200).json({
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        category: user.category,
        avatarUrl: user.avatarUrl,
        biography: user.biography,
        platform: user.platform,
        connectedSocialMedias: user,
        role: user.role,
        brand_id: user.brand_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

const handleLoginWithGoogle = asyncHandle(async (req, res) => {
  const userInfo = req.body;

  const existingUser = await UserModel.findOne({ email: userInfo.email });

  if (existingUser) {
    await UserModel.findByIdAndUpdate(existingUser.id, {
      ...userInfo,
      updated_at: Date.now(),
    });
    res.status(200).json({
      message: 'Login successfully',
      id: getJsonWebToken(existingUser.email),
    });
  } else {
    const newUser = new UserModel({
      email: userInfo.email,
      name: userInfo.name,
      ...userInfo,
    });
    await newUser.save();
    res.status(200).json({
      message: 'Login successfully',
      id: getJsonWebToken(existingUser.email),
    });
  }
});

module.exports = {
  register,
  login,
  verification,
  getUserFromToken,
  activateUser,
  resendOTP,
  forgotPassword,
  verifyOTPResetPassword,
  resetPassword,
  handleLoginWithGoogle,
  saveUser,
};
