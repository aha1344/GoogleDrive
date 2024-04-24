// Function to set up Express application and required middleware
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const session = require('express-session');
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')  // Ensure the uploads directory exists
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'userDB'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Server.');
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Route to redirect to signup page
app.get('/', (req, res) => {
    res.redirect('/signup');
});

// Route to serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Route to serve signin page
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signin.html'));
});

// Route to serve index page
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/forgotpassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'forgotpassword.html'));
});

// User registration route
app.post('/signup', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`;
    db.query(sql, [firstName, lastName, email, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).send('Database error: ' + err.message);
        }
        res.send('User registered successfully!');
    });
});
// Route to handle password change
app.post('/forgotpassword/change', (req, res) => {
    const { email, newPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const sql = `UPDATE users SET password = ? WHERE email = ?`;

    db.query(sql, [hashedPassword, email], (err, result) => {
        if (err) {
            return res.status(500).send('Database error: ' + err.message);
        }
        res.json({ message: 'Password changed successfully', error: false });
    });
});

// Sign-in with email route
app.post('/signin/email', (req, res) => {
    const { email } = req.body;
    const sql = `SELECT 1 FROM users WHERE email = ?`;
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err.message, error: true });
        }
        if (results.length > 0) {
            res.json({ message: 'Email exists', error: false });
        } else {
            res.json({ message: 'Email not found', error: true });
        }
    });
});

// Route to get user folders
app.get('/get-user-folders', function(req, res) {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(403).send('You must be logged in to view folders.');
    }

    const sql = 'SELECT * FROM folders WHERE user_id = ?';
    db.query(sql, [userId], function(err, results) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to fetch folders.');
        }
        res.json(results);
    });
});

// Backend Endpoint to Get User Files
app.get('/get-user-files', function (req, res) {
    if (!req.session.userId) {
        return res.status(401).send('Authentication required.'); // Or redirect to login page
    }
    const userId = req.session.userId;  // Retrieve user ID from session
    db.query('SELECT * FROM files WHERE user_id = ?', [userId], function (err, results) {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }
        res.json(results);
    });
});

const fs = require('fs');
// Route to create a new folder
app.post('/create-folder', (req, res) => {
    const { folderName } = req.body;
    const userId = req.session.userId;
    
    if (!userId) {
        return res.status(401).send("Please log in to create folders.");
    }

    const userDir = path.join(__dirname, 'uploads', String(userId)); // Base directory path for the user
    const folderPath = path.join(userDir, folderName);

    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            return res.status(500).send('Failed to create folder: ' + err.message);
        }
        const sql = 'INSERT INTO folders (user_id, folder_name, folder_path, creation_date) VALUES (?, ?, ?, NOW())';
        db.query(sql, [userId, folderName, folderPath], (error, results) => {
            if (error) {
                return res.status(500).send('Database error: ' + error.message);
            }
            res.send('Folder created successfully!');
        });
    });
});

// Sign-in with password route
app.post('/signin/password', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT id, password FROM users WHERE email = ?`;

    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err.message, error: true });
        }
        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: 'Bcrypt error', error: true });
                }
                if (isMatch) {
                    req.session.userId = user.id;  // Set user ID in session
                    res.json({ message: 'Logged in successfully', error: false });
                } else {
                    res.json({ message: 'Password is incorrect', error: true });
                }
            });
        } else {
            res.json({ message: 'Email not found', error: true });
        }
    });
});

// File upload route
app.post('/upload', upload.single('file'), function (req, res) {
    const userId = req.session.userId;  // Ensure you're retrieving the user ID correctly, possibly from a session or JWT token
    const file = req.file;
    if (!file) {
        return res.status(400).send('Please upload a file.');
    }
    const userDir = `uploads/${userId}`; // Ensuring files are stored under user-specific directories
    const filePath = `${userDir}/${file.originalname}`;

    const insertSql = 'INSERT INTO files (user_id, file_name, file_path, upload_date) VALUES (?, ?, ?, NOW())';
    db.query(insertSql, [userId, file.originalname, filePath], (err, result) => {
        if (err) {
            return res.status(500).send('Database error: ' + err.message);
        }
        res.send('File uploaded successfully!');
    });
});

// Backend Endpoint to Get User Files
app.get('/get-user-files', function (req, res) {
    const userId = req.session.userId;  // Or get from a token in request headers
    db.query('SELECT * FROM files WHERE user_id = ?', [userId], function (err, results) {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }
        res.json(results);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
