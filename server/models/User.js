import mongoose from "mongoose";
import bcrypt from "bcrypt";


// Define the User schema
const userSchema = new mongoose.Schema(
    
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["admin", "accountant", "auditor"],
      default: "accountant",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password before saving the user document
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//create user model
const User = mongoose.model("User", userSchema);

// Export the User model
export default User;