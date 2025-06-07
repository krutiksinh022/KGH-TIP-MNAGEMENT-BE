import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
export const successResponse = (res, data, statusCode = 200) => {
    return res.status(statusCode).json(data);
};

export const errorResponse = (res, data, statusCode = 500, error = null) => {
    if (error && error.isJoi) {
        data = { message: error.message };
        statusCode = 422;
    }
    return res.status(statusCode).json(data);
};


export const generateJwtToken = (user, expireTime) => {
  const options = {};
  
  if (expireTime) {
    options.expiresIn = expireTime; // only add expiresIn if provided
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.type },
    process.env.JWT_SECRET,
    options
  );

  return token;
};


export const generateDefaultPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}