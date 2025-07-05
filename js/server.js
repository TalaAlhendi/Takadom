// server.js
const express = require('express');
const cors = require('cors'); // To allow requests from the frontend
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- API Endpoint for Contact Form ---
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    console.log('Received submission:');
    console.log({ name, email, message });

    // ** REAL-WORLD LOGIC WOULD GO HERE **
    // 1. Validate and sanitize the inputs to prevent XSS attacks.
    // 2. Use a service like Nodemailer to send an email to info@takadom.org.
    // 3. Save the submission to a database (e.g., MongoDB or PostgreSQL).
    // 4. Return a proper success or error response.

    if (!name || !email || !message) {
        return res.status(400).json({ status: 'Error', message: 'All fields are required.' });
    }

    res.status(200).json({ status: 'Success', message: 'Thank you for your message! We will be in touch soon.' });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});