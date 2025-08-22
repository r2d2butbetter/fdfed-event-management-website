import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import Organizer from "../models/organizer.js";
import { setUser } from '../services/auth.js';
import { generateToken, generateRefreshToken } from '../services/auth.js';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  conflictResponse,
  unauthorizedResponse,
  apiWrapper
} from '../utils/responseHelpers.js';

class authController {
  // Legacy methods for server-side rendering (keeping for backward compatibility)
  async loadSignUpPage(req, res) {
    res.render("base", {
      title: "Sign-up",
      content: "sign-up",
      showLogin: true,
      showSignup: false,
    });
  }

  async loadLoginPage(req, res) {
    res.render("base", {
      title: "Login",
      content: "login",
      showLogin: false,
      showSignup: true,
    });
  }

  // React API Methods
  userSignUpAPI = apiWrapper(async (req, res) => {
    const { email, name, password1, password2 } = req.body;

    // Validation
    const validationErrors = [];

    if (!email) validationErrors.push({ field: 'email', message: 'Email is required' });
    if (!name) validationErrors.push({ field: 'name', message: 'Name is required' });
    if (!password1) validationErrors.push({ field: 'password1', message: 'Password is required' });
    if (!password2) validationErrors.push({ field: 'password2', message: 'Password confirmation is required' });

    if (password1 && password2 && password1 !== password2) {
      validationErrors.push({ field: 'password2', message: 'Passwords do not match' });
    }

    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return conflictResponse(res, 'Email already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password1, 10);

    // Create and save the user
    const newUser = new User({
      name,
      email,
      passwordHash: hashedPassword,
    });
    await newUser.save();

    // Generate tokens
    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    return successResponse(res, {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || 'user'
      },
      token,
      refreshToken
    }, 'User registered successfully', 201);
  });

  userLoginAPI = apiWrapper(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return validationErrorResponse(res, [
        !email && { field: 'email', message: 'Email is required' },
        !password && { field: 'password', message: 'Password is required' }
      ].filter(Boolean));
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Also maintain session for backward compatibility
    const sessionId = uuidv4();
    setUser(sessionId, user);

    // Set cookies for both session and JWT
    res.cookie("uid", sessionId, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return successResponse(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      },
      token,
      refreshToken
    }, 'Login successful');
  });

  // Legacy methods for server-side rendering (updated to use database)
  async userSignUp(req, res) {
    const { email, name, password1, password2 } = req.body;

    if (!email || !name || !password1 || !password2) {
      return res.status(400).send("All fields are required.");
    }
    if (password1 !== password2) {
      return res.status(400).send("Passwords do not match.");
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send("Email already registered.");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password1, 10);

      // Create and save the user
      const newUser = new User({
        name,
        email,
        passwordHash: hashedPassword,
      });
      await newUser.save();

      console.log("User registered successfully.");
      res.redirect("/");
    } catch (error) {
      console.error("Error during sign-up:", error);
      res.status(500).send("An error occurred during sign-up.");
    }
  }

  async userLogin(req, res) {
    const { email, password } = req.body;

    try {
      console.log("Login request received:", { email, password });

      // Find the user in the MongoDB database
      const user = await User.findOne({ email });

      if (!user) {
        console.log("User not found");
        return res.status(401).send("Invalid email or password.");
      }

      console.log("User retrieved:", user);

      // Compare the provided password with the hashed password stored in MongoDB
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      console.log("Password match status:", passwordMatch);

      if (!passwordMatch) {
        return res.status(401).send("Invalid email or password.");
      }

      // Generate a new session ID
      const sessionId = uuidv4();
      console.log("Generated session ID:", sessionId);

      req.session.userId = user._id; // Store the user's ID in the session
      console.log("User ID saved to session:", req.session.userId);

      // Save session information using your session service
      setUser(sessionId, user);

      // Set the session ID in cookies
      res.cookie("uid", sessionId, { httpOnly: true });

      // Redirect to the user's dashboard
      res.redirect('/user/dashboard');
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("An error occurred during login.");
    }
  }


  async orgLogin(req, res) {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.redirect("/login");
      }

      const organizer = await Organizer.findOne({ userId: user._id });
      if (organizer) {
        return res.redirect("/organizer/dashboard");
      }

      // User is authenticated but not an organizer
      res.render("base", {
        title: "Host with us",
        content: "host_with_us",
        showLogin: false,
        showSignup: false,
      });
    } catch (error) {
      console.error("Error checking organizer status:", error);
      res.status(500).send("An error occurred.");
    }
  }

  async orgRegistration(req, res) {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const { orgName, description, mobile } = req.body;

    if (!orgName || !mobile) {
      return res.status(400).send("Organization name and contact number are required.");
    }

    try {
      const newOrganizer = new Organizer({
        userId: req.session.userId,
        organizationName: orgName,
        description: description || "No description provided",
        contactNo: mobile,
      });
      await newOrganizer.save();

      res.redirect("/organizer/dashboard");
    } catch (error) {
      console.error("Error saving organizer details:", error);
      res.status(500).send("An error occurred.");
    }
  }
  async logout(req, res) {
    // Get the session ID from cookies
    const sessionId = req.cookies.uid;

    if (sessionId) {
      try {
        // Remove the user from the session map by setting it to null
        setUser(sessionId, null);

        // Clear the session ID cookie
        res.clearCookie("uid");

        // Clear the session data
        if (req.session) {
          req.session.destroy(err => {
            if (err) {
              console.error("Error destroying session:", err);
            }
          });
        }

        console.log("User logged out successfully");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }

    // Redirect to the home page
    res.redirect('/');
  }

  // API Methods for React Frontend
  orgLoginAPI = apiWrapper(async (req, res) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    const organizer = await Organizer.findOne({ userId: req.user.id });
    if (organizer) {
      return successResponse(res, {
        organizer: {
          id: organizer._id,
          organizationName: organizer.organizationName,
          description: organizer.description,
          contactNo: organizer.contactNo,
          verified: organizer.verified || false
        },
        redirectTo: '/organizer/dashboard'
      }, 'Organizer authenticated');
    }

    return successResponse(res, {
      isOrganizer: false,
      message: 'User is not an organizer',
      redirectTo: '/become-organizer'
    }, 'User authentication successful');
  });

  orgRegistrationAPI = apiWrapper(async (req, res) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    const { orgName, description, mobile } = req.body;

    // Validation
    const validationErrors = [];
    if (!orgName) validationErrors.push({ field: 'orgName', message: 'Organization name is required' });
    if (!mobile) validationErrors.push({ field: 'mobile', message: 'Contact number is required' });

    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Check if user is already an organizer
    const existingOrganizer = await Organizer.findOne({ userId: req.user.id });
    if (existingOrganizer) {
      return conflictResponse(res, 'User is already registered as an organizer');
    }

    const newOrganizer = new Organizer({
      userId: req.user.id,
      organizationName: orgName,
      description: description || "No description provided",
      contactNo: mobile,
    });
    await newOrganizer.save();

    return successResponse(res, {
      organizer: {
        id: newOrganizer._id,
        organizationName: newOrganizer.organizationName,
        description: newOrganizer.description,
        contactNo: newOrganizer.contactNo
      }
    }, 'Organizer registration successful', 201);
  });

  logoutAPI = apiWrapper(async (req, res) => {
    // Get the session ID from cookies
    const sessionId = req.cookies.uid;

    if (sessionId) {
      // Remove the user from the session map
      setUser(sessionId, null);
    }

    // Clear all auth-related cookies
    res.clearCookie("uid");
    res.clearCookie("refreshToken");

    return successResponse(res, null, 'Logout successful');
  });
} export default new authController();
