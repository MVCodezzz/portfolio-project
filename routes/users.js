const express = require("express");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const router = express.Router();
const saltRounds = 10;

// Middleware to handle unauthenticated users
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
};

// Fetch Profile
router.get("/profile", redirectLogin, (req, res) => {
    const sql = "SELECT username, first_name, last_name, email FROM users WHERE username = ?";
    db.query(sql, [req.session.userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching user data." });

        if (results.length > 0) {
            const user = results[0];
            res.json({ user });
        } else {
            req.session.destroy();
            res.status(401).json({ message: "Session expired. Please log in again." });
        }
    });
});

// Registration Route
router.post(
    "/register",
    [
        check("email").isEmail().withMessage("Enter a valid email."),
        check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Validation failed." });
        }

        const { username, firstName, lastName, email, password } = req.body;

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: "Error hashing password." });

            const sql = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
            db.query(sql, [username, firstName, lastName, email, hashedPassword], (err) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({ message: "Username or email already exists." });
                    }
                    return res.status(500).json({ message: "Error registering user." });
                }

                res.status(201).json({ message: "Registration successful! You can now log in." });
            });
        });
    }
);

// Login Route
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT username, first_name, last_name, email, hashedPassword FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching user data." });

        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.hashedPassword, (err, isMatch) => {
                if (err) return res.status(500).json({ message: "Error comparing passwords." });

                if (isMatch) {
                    req.session.userId = username;
                    res.json({
                        user: {
                            username: user.username,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            email: user.email,
                        },
                        message: "Login successful!",
                    });
                } else {
                    res.status(401).json({ message: "Invalid username or password." });
                }
            });
        } else {
            res.status(401).json({ message: "Invalid username or password." });
        }
    });
});

// Logout Route
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Error logging out." });
        res.json({ message: "You have successfully logged out." });
    });
});

module.exports = router;
