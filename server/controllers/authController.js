// import { v4 as uuidv4 } from 'uuid';
// import { setUser } from '../services/auth.js';
// import { getUser } from '../services/auth.js';
// import cookieParser from 'cookie-parser';
// import db from '../connection.js';
// import bcrypt from 'bcrypt';

// class authController {

//     async loadSignUpPage (req, res){
//       res.render('base', { title: 'Sign-up', content: 'sign-up', showLogin: true, 
//         showSignup: false });
//     }

//     async loadLoginPage (req, res){
//       res.render('base', { title: 'Login', content: 'login', showLogin: false, 
//         showSignup: true  });
//     }
//     // async userSignUp  (req, res) {
//     //     const { email, name, password1, password2 } = req.body;

//     //     // Validate input
//     //     // if (users.find((user) => user.email === email)) {
//     //     //   return res.status(400).send("Email already registered.");
//     //     // }

//     //     if (!email || !name || !password1 || !password2) {
//     //       return res.status(400).send("All fields are required.");
//     //     }
//     //     if (password1 !== password2) {
//     //       return res.status(400).send("Passwords do not match.");
//     //     }

//     //     try {
//     //       // Check if user already exists
//     //       const existingUser = await db.get(`SELECT * FROM User WHERE email = ?`, [email]);
//     //       if (existingUser) {
//     //         return res.status(400).send("Email already registered.");
//     //       }
//     //       console.log("existinguser: ", existingUser);

//     //       // Hash the password
//     //       const hashedPassword = await bcrypt.hash(password1, 10);
//     //       console.log("password is hashed");

//     //       // Insert the user into the database
//     //       await db.run(
//     //         `INSERT INTO User (name, email, passwordHash) VALUES (?, ?, ?)`,
//     //         [name, email, hashedPassword]
//     //       );

//     //       console.log("user inserted");

//     //       res.status(201).send("User registered successfully.");
//     //     } catch (error) {
//     //       console.error(error);
//     //       res.status(500).send("An error occurred during sign-up.");
//     //     }

//     //     // // Add user to the in-memory database
//     //     // users.push({ email, firstName, password: password1 });

//     //     //redirect user to home page
//     //     res.redirect('/');
//     // }

//     async userSignUp(req, res) {
//       const { email, name, password1, password2 } = req.body;

//       // Validate input
//       if (!email || !name || !password1 || !password2) {
//         return res.status(400).send("All fields are required.");
//       }
//       if (password1 !== password2) {
//         return res.status(400).send("Passwords do not match.");
//       }

//       try {
//         // Check if user already exists
//         const existingUser = await new Promise((resolve, reject) => {
//           db.get(`SELECT * FROM User WHERE email = ?`, [email], (err, row) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(row);
//             }
//           });
//         });

//         if (existingUser) {
//           console.log("existinguser: ", existingUser);
//           return res.status(400).send("Email already registered.");
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password1, 10);
//         console.log("password is hashed");

//         // Insert the user into the database
//         await new Promise((resolve, reject) => {
//           db.run(
//             `INSERT INTO User (name, email, passwordHash) VALUES (?, ?, ?)`,
//             [name, email, hashedPassword],
//             function (err) {
//               if (err) {
//                 reject(err);
//               } else {
//                 resolve();
//               }
//             }
//           );
//         });

//         console.log("user inserted");
//         // Only send one response - using redirect
//         return res.redirect('/');
//       } catch (error) {
//         console.error(error);
//         res.status(500).send("An error occurred during sign-up.");
//       }
//     }


//     // async userLogin  (req, res) {
//     //     const {email, password} = req.body;

//     //     // if(!users.find((user) => user.email == email && user.password == password)){
//     //     //   return res.status(401).send("Invalid email or password");
//     //     // }
//     //     // const user = users.find((user) => user.email === email);

//     //     try {
//     //       // Find the user in the database
//     //       const user = await db.get(`SELECT * FROM User WHERE email = ?`, [email]);

//     //       if (!user) {
//     //         return res.status(401).send("Invalid email or password.");
//     //       }

//     //       // Compare the provided password with the hashed password
//     //       const passwordMatch = await bcrypt.compare(password, user.passwordHash);
//     //       if (!passwordMatch) {
//     //         return res.status(401).send("Invalid email or password.");
//     //       }

//     //     const sesionId = uuidv4();
//     //     setUser(sesionId, user);
//     //     res.cookie("uid",sesionId);
//     //     res.redirect('/');

//     //     }catch (error) {
//     //       console.error(error);
//     //       res.status(500).send("An error occurred during login.");
//     //     }
//     // }
//     async userLogin(req, res) {
//       const { email, password } = req.body;

//       try {
//         console.log("Login request received:", { email, password });

//         // Find the user in the database
//         const user = await new Promise((resolve, reject) => {
//           db.get(`SELECT * FROM User WHERE email = ?`, [email], (err, row) => {
//             if (err) {
//               console.error("Database error:", err);
//               return reject(err);
//             }
//             resolve(row);
//           });
//         });

//         console.log("User retrieved:", user);

//         if (!user) {
//           console.log("User not found");
//           return res.status(401).send("Invalid email or password.");
//         }

//         // Compare the provided password with the hashed password
//         const passwordMatch = await bcrypt.compare(password, user.passwordHash);
//         console.log("Password match status:", passwordMatch);

//         if (!passwordMatch) {
//           return res.status(401).send("Invalid email or password.");
//         }

//         const sessionId = uuidv4();
//         console.log("Generated session ID:", sessionId);

//         setUser(sessionId, user);
//         res.cookie("uid", sessionId);
//         res.redirect('/user/dashboard');
//       } catch (error) {
//         console.error("Error during login:", error);
//         res.status(500).send("An error occurred during login.");
//       }
//     }

//     async orgLogin(req,res) {
//       const sessionId = req.cookies.uid;
//       const user = getUser(sessionId);

//       try {
//         const organizer = await new Promise((resolve, reject) => {
//           db.get(`SELECT * FROM Organizer WHERE userId = ?`, [user.userId], (err, row) => {
//             if (err) return reject(err);
//             resolve(row);
//           });
//         });

//         if (organizer) {
//           // User is already an organizer
//           return res.redirect('/organizer/dashboard'); // Redirect to the organizer's dashboard
//         }

//         // User is authenticated but not an organizer, show the organizer form
//         res.render('base', { title: 'Host with us', content: 'host_with_us', showLogin: false, 
//           showSignup: false });
//         // res.render('host_with_us', { title: 'Host with Us', user });
//       } catch (error) {
//         console.error('Error checking organizer status:', error);
//         res.status(500).send('An error occurred.');
//       }
//     }

//     async orgRegistration(req,res) {
//       const sessionId = req.cookies.uid;
//       const user = getUser(sessionId);
//       console.log("User id : ",user)
//       const { orgName, description, mobile } = req.body;

//       if (!orgName || !mobile) {
//         return res.status(400).send('Organization name and contact number are required.');
//       }

//       try {
//         await new Promise((resolve, reject) => {
//           db.run(
//             `INSERT INTO Organizer (userId, organizationName, description, contactNo) VALUES (?, ?, ?, ?)`,
//             [user.userId, orgName, description, mobile],
//             (err) => {
//               if (err) return reject(err);
//               resolve();
//             }
//           );
//         });

//         res.redirect('/organizer/dashboard'); // Redirect to organizer dashboard after successful registration
//       } catch (error) {
//         console.error('Error saving organizer details:', error);
//         res.status(500).send('An error occurred.');
//       }
//     }



// };

// export default new authController();


import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import User from "../models/user.js"; // Assuming User is a Mongoose model
import Organizer from "../models/organizer.js"; // Assuming Organizer is a Mongoose model
import { setUser } from '../services/auth.js';

class authController {
  // loadSignUpPage and loadLoginPage methods removed
  // React frontend handles these UI pages

  async userSignUp(req, res) {
    const { email, name, password1, password2 } = req.body;

    if (!email || !name || !password1 || !password2) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }
    if (password1 !== password2) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match."
      });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered."
        });
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

      // Return JSON response for React frontend
      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: {
          userId: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error("Error during sign-up:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during sign-up."
      });
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
        return res.status(401).json({
          success: false,
          message: "Invalid email or password."
        });
      }

      console.log("User retrieved:", user);

      // Compare the provided password with the hashed password stored in MongoDB
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      console.log("Password match status:", passwordMatch);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password."
        });
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

      // Return JSON response for React frontend
      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: {
          userId: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during login."
      });
    }
  }


  async orgLogin(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
        isAuthenticated: false
      });
    }

    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please log in again.",
          isAuthenticated: false
        });
      }

      const organizer = await Organizer.findOne({ userId: user._id });
      if (organizer) {
        // User is already an organizer
        return res.status(200).json({
          success: true,
          message: "User is already an organizer.",
          isOrganizer: true,
          data: {
            organizerId: organizer._id,
            organizationName: organizer.organizationName,
            verified: organizer.verified
          }
        });
      }

      // User is authenticated but not an organizer
      return res.status(200).json({
        success: true,
        message: "User is authenticated but not an organizer.",
        isOrganizer: false,
        data: {
          userId: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Error checking organizer status:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while checking organizer status."
      });
    }
  }

  async orgRegistration(req, res) {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to register as an organizer."
      });
    }

    const { orgName, description, mobile } = req.body;

    if (!orgName || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Organization name and contact number are required."
      });
    }

    try {
      // Check if user is already an organizer
      const existingOrganizer = await Organizer.findOne({ userId: req.session.userId });
      if (existingOrganizer) {
        return res.status(400).json({
          success: false,
          message: "You are already registered as an organizer."
        });
      }

      const newOrganizer = new Organizer({
        userId: req.session.userId,
        organizationName: orgName,
        description: description || "No description provided",
        contactNo: mobile,
      });
      await newOrganizer.save();

      return res.status(201).json({
        success: true,
        message: "Successfully registered as an organizer!",
        data: {
          organizerId: newOrganizer._id,
          organizationName: newOrganizer.organizationName,
          contactNo: newOrganizer.contactNo,
          verified: newOrganizer.verified || false
        }
      });
    } catch (error) {
      console.error("Error saving organizer details:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while registering as an organizer."
      });
    }
  }
  async logout(req, res) {
    // Get the session ID from cookies
    const sessionId = req.cookies.uid;

    if (sessionId) {
      try {
        // Import the necessary function to handle the user session
        const { setUser } = await import('../services/auth.js');

        // Remove the user from the session map by setting it to null
        setUser(sessionId, null);

        // Clear the session ID cookie
        res.clearCookie("uid");

        // Clear the session data
        if (req.session) {
          req.session.destroy(err => {
            if (err) {
              console.error("Error destroying session:", err);
              return res.status(500).json({
                success: false,
                message: "Error during logout."
              });
            }

            console.log("User logged out successfully");
            return res.status(200).json({
              success: true,
              message: "Logout successful."
            });
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "Logout successful."
          });
        }

        console.log("User logged out successfully");
      } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({
          success: false,
          message: "Error during logout."
        });
      }
    } else {
      // No session to logout
      return res.status(200).json({
        success: true,
        message: "No active session."
      });
    }
  }
}

export default new authController();
