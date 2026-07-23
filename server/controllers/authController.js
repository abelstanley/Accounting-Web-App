import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

//Function to register a new user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Create the user
    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Function to log in a user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare the entered password with the stored hash
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Function to get the user profile
export const getUserProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: req.user,
  });
};