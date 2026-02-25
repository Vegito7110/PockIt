const admin = require('firebase-admin');
const User = require('../models/user.js'); 

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decodedToken = await admin.auth().verifyIdToken(token);
    

    const { uid, email, name, phone_number } = decodedToken;


    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {

      console.log(`✨ Creating new user in DB for: ${email}`);
      
      const newUserDetails = {
        firebaseUid: uid,
        email: email,
        displayName: name || '',
        ...(phone_number && { phone_number: phone_number }) 
      };

      user = new User(newUserDetails);
      await user.save();
    }


    req.user = user; 
    next();

  } catch (error) {

    console.error('Authentication error:', error);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).send({ error: 'Unauthorized: Token expired.' });
    }

    if (error.code === 11000) {
        return res.status(409).send({ error: 'Conflict: User with this email or phone number already exists.'});
    }
    return res.status(401).send({ error: 'Unauthorized: Invalid token.' });
  }
};

module.exports = authMiddleware;