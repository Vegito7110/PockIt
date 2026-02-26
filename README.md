PockIt 🎙️💰

Speak It. Track It. PockIt.
An AI-powered, voice-activated personal expense tracker built with the MERN stack and LangChain.

🚀 View Live Demo: https://pock-it.vercel.app/

PockIt revolutionizes personal finance by allowing users to log transactions using natural language voice commands. Stop typing and start speaking—PockIt will automatically categorize, format, and save your financial data, presenting it in a beautiful, analytical dashboard.

🌟 Key Features

AI Voice Transactions: Speak your expenses (e.g., "I spent ₹500 on food yesterday"), and PockIt automatically extracts the amount, category, date, and vendor.

Smart Dashboard: Visualize your spending habits with dynamic pie charts and bar graphs.

Advanced Filtering: Sort transactions by time period (Last 7 days, This Month, This Year) and type (Income/Expense).

Secure Authentication: User-specific, protected data powered by Firebase Auth.

🏗️ Architecture & Tech Stack

PockIt is built using a decoupled client-server architecture. Below is a detailed breakdown of how each technology powers the application.

1. Frontend Architecture (React)

The frontend is a Single Page Application (SPA) built with React.

React Engine & Fiber: We leverage React's Virtual DOM and Fiber architecture to efficiently execute component functions and reconcile state changes (like applying transaction filters) without reloading the page.

Routing: react-router-dom acts as a giant switch statement, intercepting URL changes to navigate seamlessly between the Landing Page, Login/Register, Home (Transactions), and Dashboard.

Component Structure: * The <HomePage /> manages the main UI, wrapping the <Header /> and <Transactions /> components.

The <AddTransaction /> component bridges the user to the Web Speech API, capturing audio, translating it to text, and dispatching it to the backend via Axios.

The <Dashboard /> utilizes Recharts to render visual analytics based on the user's financial data.

2. Backend Architecture (Node.js & Express)

The backend is a robust RESTful API built with Node.js and Express.

V8 Engine & Event Loop: Node.js runs on a single thread utilizing the V8 Engine. Because API calls to MongoDB and the AI LLM take time, the backend offloads these asynchronous tasks to the Libuv C++ bindings. This allows the main Event Loop to continue processing other incoming HTTP requests while waiting for the database or AI to respond.

Routing & Controllers: * transactionRouter.js handles all CRUD operations for the user's data.

aiRouter.js acts as the dedicated endpoint for processing unstructured voice text.

3. Authentication & Security (Firebase)

We implemented Firebase Authentication (signInWithEmailAndPassword, createUserWithEmailAndPassword) to handle user identity securely.

Frontend: An onAuthStateChanged listener wraps the React application. If a user is not authenticated, protected routes automatically redirect them to the login page.

Backend: Every protected API request passes through an authMiddleware.js. This middleware extracts the Firebase Token from the request headers, verifies it, and attaches the userId to the request, ensuring users can only fetch or modify their own private data.

4. Database (MongoDB)

Data persistence is handled by MongoDB, a NoSQL database, accessed via Mongoose.

Schemas: We define strict Object Data Modeling (ODM) schemas for Users and Transactions in the backend.

Once the AI or the manual form generates a valid transaction object, Mongoose communicates with the MongoDB cluster over the network to store the document safely.

5. AI Data Extraction (LangChain & Groq/Gemini)

To turn unstructured voice notes into structured database entries, we integrated LangChain.

The Flow: The React frontend captures a voice string and POSTs it to the Node.js backend (/send-to-dialogflow).

Zod Schemas: We define a strict z.object schema containing required fields: amount (number), type (income/expense), category, and date.

The LLM Pipeline: LangChain pipes a system prompt along with the user's text to an ultra-low-latency LLM (Groq or Gemini). By using .withStructuredOutput(), we force the LLM to return a perfectly formatted JSON object that matches our Zod schema. This structured data is then sent back to the frontend for the user to confirm and save to MongoDB.

🚀 Installation & Setup

To run PockIt locally on your machine:

Prerequisites

Node.js installed

A MongoDB cluster (Atlas or local)

A Firebase Project (for Auth)

An API Key for Groq or Google Gemini

1. Clone the repository

git clone [https://github.com/yourusername/PockIt.git](https://github.com/yourusername/PockIt.git)
cd PockIt


2. Setup Backend

cd backend
npm install


Create a .env file in the backend directory and add your credentials:

PORT=5000
MONGODB_URI=your_mongo_connection_string
GROQ_API_KEY=your_groq_api_key


Start the backend server:

npm start


3. Setup Frontend

Open a new terminal and navigate to the frontend folder:

cd frontend
npm install


Create a .env file in the frontend directory and add your Firebase credentials:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other firebase config


Start the React development server:

npm run dev


Designed and developed by [Your Name/Handle].
