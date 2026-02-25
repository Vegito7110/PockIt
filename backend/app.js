//imports
require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express()
const connectDB = require('./db/connect')
const admin = require('firebase-admin')
// const serviceAccount = require('./serviceAccount.json')
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
//routers
const authRouter  = require('./routes/authRouter')
const transactionsRouter = require('./routes/transactionRouter')
const aiRouter = require('./routes/aiRouter') // <-- 1. IMPORT NEW ROUTER

// Initialize Firebase Admin (do this ONCE in your main index.js/server.js)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//middleware
app.use(express.json())
app.use(cors({
  origin: 'https://pock-it.vercel.app/', // Replace with your actual Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));


// //routes
// app.use('/app/v1/auth',authRouter)
app.use('/api/transactions',transactionsRouter)
app.use('/api', aiRouter) // <-- 2. USE NEW ROUTER

//server
const PORT = process.env.PORT || 3000;
const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`App has started on port ${port}`));
    } catch (error) {
        console.log(error)
    }
}
start();
