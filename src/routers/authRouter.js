const Router = require('express');
const {
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
} = require('../controllers/authController');

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verification', verification);
authRouter.get('/me', getUserFromToken);
authRouter.post('/validate-otp/active-user', activateUser);
authRouter.post('/resend-otp/active-user', resendOTP);
authRouter.post('/resend-otp/reset-password', forgotPassword);
authRouter.post('/validate-otp/reset-password', verifyOTPResetPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/login-3rd-party', handleLoginWithGoogle);

module.exports = authRouter;
