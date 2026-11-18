import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET_KEY || "your_jwt_secret_key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "365d",
    }
  );

  const days = parseInt(process.env.COOKIE_EXPIRES_IN, 10) || 365;
  const cookieExpires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // Cross-site cookie configuration:
  // When frontend is on vercel.app and backend is on onrender.com (cross-origin HTTPS),
  // sameSite MUST be "none" and secure MUST be true for modern browsers.
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: cookieExpires,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};
