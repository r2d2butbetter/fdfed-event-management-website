// import db from '../connection.js'

// const createUserTable = async () => {
//     await db.exec(`
//       CREATE TABLE IF NOT EXISTS User (
//         userId INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT NOT NULL,
//         email TEXT UNIQUE NOT NULL,
//         passwordHash TEXT NOT NULL,
//         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//       );
//     `);
// };

// export default createUserTable;

  
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

export default User;
