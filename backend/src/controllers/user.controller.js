import User from "../models/user.model.js";

// @desc Get all users
// @route GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// @desc Get a single user by ID
// @route GET /api/users/:id
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// @desc Get a single user by personalEmail
// @route GET /api/users/by-email?personalEmail=...
export const getUserByEmail = async (req, res) => {
  try {
    const { personalEmail } = req.query;
    if (!personalEmail) {
      return res.status(400).json({ message: "personalEmail query param is required" });
    }
    const user = await User.findOne({ personalEmail: String(personalEmail).toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// @desc Create a new user
// @route POST /api/users
export const createUser = async (req, res) => {
  try {
    const { fullName, personalEmail, collegeEmail, whatsappNumber, gender } = req.body;

    // Basic validation
    if (!fullName || !personalEmail || !collegeEmail || !whatsappNumber || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate emails
    const existingUser = await User.findOne({
      $or: [{ personalEmail }, { collegeEmail }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const newUser = new User({
      fullName,
      personalEmail,
      collegeEmail,
      whatsappNumber,
      gender,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

// @desc Update an existing user
// @route PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// @desc Delete a user
// @route DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// @desc Check if user exists by personalEmail
// @route GET /api/users/exists?personalEmail=...
export const checkUserExists = async (req, res) => {
  try {
    const { personalEmail } = req.query;
    if (!personalEmail) {
      return res.status(400).json({ message: "personalEmail query param is required" });
    }
    const user = await User.findOne({ personalEmail: String(personalEmail).toLowerCase() });
    return res.status(200).json({ exists: Boolean(user) });
  } catch (error) {
    res.status(500).json({ message: "Failed to check user existence", error: error.message });
  }
};