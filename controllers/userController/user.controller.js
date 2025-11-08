import cloudinary from "../../config/cloudinary.js";
import User from "../../models/user.model.js";

const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profile_photos" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, phone, designation, profilePhoto, selectedHotelId } =
      req.body;

    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    // Handle profile photo upload if file is provided
    let profilePhotoUrl = null;

    if (req.file) {
      // If a new file is uploaded, upload to cloudinary
      profilePhotoUrl = await streamUpload(req.file.buffer);
    } else if (
      profilePhoto &&
      typeof profilePhoto === "string" &&
      profilePhoto.trim() !== ""
    ) {
      // If profilePhoto is a valid URL string, use it
      profilePhotoUrl = profilePhoto;
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(designation !== undefined && { designation }),
      ...(selectedHotelId !== undefined && { selectedHotelId }),
      ...(profilePhotoUrl && { profilePhoto: profilePhotoUrl }),
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Use findById for a single document (more efficient than find)
    const user = await User.findById(userId).select("-password"); // exclude sensitive data

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
