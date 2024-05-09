const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const conn = require('./connection');
const app = express();
const PORT = process.env.PORT || 3000;
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const trans = require('./models/transactions');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied: No Token Provided!');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
}

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password != password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const payload = {
            user: {
                id: user._id.toString()
            }
        };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: "Login successful",
                    token
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(200).json({ msg: 'User already exists' });
        }
        user = new User({
            username,
            email,
            password
        });
        await user.save();
        res.status(400).json({ msg: 'User created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


app.get('/user-details',auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).send('User not found');
        res.status(200).json({ name: user.username, email: user.email });
        console.log(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
