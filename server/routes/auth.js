const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendOTP } = require('../utils/emailService');

// Generate random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        const user = new User({
            name,
            email,
            password,
            role: role || 'student',
            isVerified: false,
            otp: {
                code: otp,
                expiresAt: otpExpiresAt
            }
        });

        await user.save();

        // Send OTP email
        await sendOTP(email, otp, name);

        res.status(201).json({
            message: 'Registration successful. Please verify your email with the OTP sent.',
            userId: user._id,
            email: user.email
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Check OTP
        if (!user.otp || user.otp.code !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Check expiration
        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
        }

        // Verify user
        user.isVerified = true;
        user.otp = undefined;
        await user.save();

        // Create session
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.name = user.name;
        req.session.role = user.role;

        res.json({
            message: 'Email verified successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = {
            code: otp,
            expiresAt: otpExpiresAt
        };
        await user.save();

        // Send OTP email
        await sendOTP(email, otp, user.name);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ error: 'Please verify your email first' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        req.session.userId = user._id;
        req.session.email = user.email;
        req.session.name = user.name;
        req.session.role = user.role;

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

// Get current user
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            user: {
                id: req.session.userId,
                name: req.session.name,
                email: req.session.email,
                role: req.session.role
            }
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

module.exports = router;