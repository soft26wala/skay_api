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

  const isProduction = process.env.NODE_ENV === "production";

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: cookieExpires,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    })
    .json({
      success: true,
      user,
      message,
      token,
    });
};
