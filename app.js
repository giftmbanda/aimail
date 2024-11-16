const express = require('express');
const session = require('express-session');
const passport = require('./config/auth'); // Ensure correct path to auth config
const gpt3Routes = require('./routes/gpt3Routes');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const connectDB = require('./config/database');
const cors = require('cors');

// Connect to MongoDB
// connectDB(); // REMEMBER TO UNCOMMENT THIS
const app = express();

app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // For form data parsing


// Configure CORS
app.use(cors({
    origin: 'http://localhost:4200', // Your Angular app URL
    credentials: true // Allow cookies to be sent with requests
}));

// Middleware for session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/auth', authRoutes); // Routes related to authentication start with /auth
app.use('/email', emailRoutes); // Routes related to email start with /email
app.use('/gpt3', gpt3Routes); // Routes related to GPT-3 start with /gpt3

// Home route for basic info
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API. Use /auth/google to authenticate.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
