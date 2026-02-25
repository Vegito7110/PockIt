require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express()
const connectDB = require('./db/connect')
const admin = require('firebase-admin')

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const transactionsRouter = require('./routes/transactionRouter')
const aiRouter = require('./routes/aiRouter') 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


app.use(express.json())
app.use(cors({
  origin: 'https://pock-it.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));



app.use('/api/transactions',transactionsRouter)
app.use('/api', aiRouter) 


const PORT = process.env.PORT || 3000;
const start = async()=>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, console.log(`App has started on port ${PORT}`));
    } catch (error) {
        console.log(error)
    }
}
start();
