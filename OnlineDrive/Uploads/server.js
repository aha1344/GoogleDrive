// Function to set up Express application and required middleware
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const archiver = require('archiver');

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
        cb(null, 'uploads/') // Ensure the uploads directory exists
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Save the original filename
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
    res.redirect('/signin');
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
app.post('/share', (req, res) => {
    // Logic to share the file
});

// Route to handle file download
app.post('/download', (req, res) => {
    const { itemId, itemType } = req.body;

    if (itemType === 'file') {
        // Retrieve file path from the database based on file ID
        const sql = 'SELECT file_path FROM files WHERE id = ?';
        db.query(sql, [itemId], (err, results) => {
            if (err) {
                return res.status(500).send('Database error: ' + err.message);
            }
            if (results.length === 0) {
                return res.status(404).send('File not found in the database');
            }

            const filePath = results[0].file_path;


            // Stream the file to the client for download
            res.download(filePath, (err) => {
                if (err) {
                    return res.status(500).send('Error downloading file: ' + err.message);
                }
            });
        });
    } else if (itemType === 'folder') {
        // Retrieve folder path from the database based on folder ID
        const sql = 'SELECT folder_path FROM folders WHERE id = ?';
        db.query(sql, [itemId], (err, results) => {
            if (err) {
                return res.status(500).send('Database error: ' + err.message);
            }
            if (results.length === 0) {
                return res.status(404).send('Folder not found in the database');
            }

            const folderPath = results[0].folder_path;

            // Compress the folder into a ZIP file
            const zipFilePath = `${folderPath}.zip`;
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip');

            output.on('close', () => {
                // Stream the ZIP file to the client for download
                res.download(zipFilePath, (err) => {
                    if (err) {
                        return res.status(500).send('Error downloading ZIP file: ' + err.message);
                    }
                    // Delete the ZIP file after download
                    fs.unlink(zipFilePath, (err) => {
                        if (err) {
                            console.error('Error deleting ZIP file:', err);
                        }
                    });
                });
            });

            output.on('error', (err) => {
                return res.status(500).send('Error creating ZIP file: ' + err.message);
            });

            archive.pipe(output);
            archive.directory(folderPath, false); // Compress folder contents without the folder itself
            archive.finalize();
        });
    } else {
        res.status(400).send('Invalid item type');
    }
});

app.post('/rename', (req, res) => {
    const { itemId, itemType, newName } = req.body;

    let sql;
    if (itemType === 'file') {
        sql = 'UPDATE files SET file_name = ? WHERE id = ?';
    } else if (itemType === 'folder') {
        sql = 'UPDATE folders SET folder_name = ? WHERE id = ?';
    } else {
        return res.status(400).send('Invalid item type');
    }

    db.query(sql, [newName, itemId], (err, result) => {
        if (err) {
            console.error("Database error when renaming:", err);
            return res.status(500).send('Database error: ' + err.message);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Item not found');
        }
        res.send(`${itemType} renamed successfully to ${newName}!`);
    });
});


app.post('/star', (req, res) => {
    // Logic to star the file
});

app.post('/move-to-trash', (req, res) => {
    // Logic to move the file to trash
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
const fs = require('fs');
// Route to create a new folder
app.post('/create-folder', (req, res) => {
    const { folderName } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Please log in to create folders." });
    }

    const userDir = path.join(__dirname, 'uploads', String(userId));
    const folderPath = path.join(userDir, folderName);

    fs.access(folderPath, fs.constants.F_OK, (err) => {
        if (!err) {
            return res.status(409).json({ success: false, message: "Folder already exists." });
        }
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to create folder: ' + err.message });
            }
            const sql = 'INSERT INTO folders (user_id, folder_name, folder_path, creation_date) VALUES (?, ?, ?, NOW())';
            db.query(sql, [userId, folderName, folderPath], (error, results) => {
                if (error) {
                    return res.status(500).json({ success: false, message: 'Database error: ' + error.message });
                }
                res.json({ success: true, message: 'Folder created successfully!' });
            });
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
                    req.session.userId = user.id; // Set user ID in session
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
    const userId = req.session.userId; // Ensure you're retrieving the user ID correctly, possibly from a session or JWT token
    const file = req.file;
    if (!file) {
        return res.status(400).send('Please upload a file.');
    }
    const userDir = `uploads/`; // Corrected directory name
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
    const userId = req.session.userId; // Ensure user is authenticated
    const searchQuery = req.query.query || ''; // Retrieve the search query from the URL

    // Modify the SQL query to include a LIKE clause for searching by file name
    const sql = `
        SELECT files.*, users.first_name AS owner, files.file_path AS location, files.upload_date AS reason_suggested
        FROM files
        INNER JOIN users ON files.user_id = users.id
        WHERE files.user_id = ? AND files.file_name LIKE ?
    `;

    db.query(sql, [userId, `%${searchQuery}%`], function (err, results) {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }
        res.json(results);
    });
});

app.get('/get-user-folders', function (req, res) {
    const userId = req.session.userId; // Or get from a token in request headers
    const searchQuery = req.query.query || ''; // Retrieve the search query from the URL

    const sql = `
        SELECT folders.*, users.first_name AS owner
        FROM folders
        INNER JOIN users ON folders.user_id = users.id
        WHERE folders.user_id = ? AND folders.folder_name LIKE ?
    `;

    db.query(sql, [userId, `%${searchQuery}%`], function (err, results) {
        if (err) {
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }
        res.json(results);
    });
});


app.post('/delete-item', (req, res) => {
    const { itemId, itemType } = req.body;

    if (itemType === 'file') {
        // Delete file record from the database
        db.query('DELETE FROM files WHERE id = ?', [itemId], (err, result) => {
            if (err) {
                return res.status(500).send('Database error: ' + err.message);
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('File not found in the database');
            }
            res.send('File deleted successfully!');
        });
    } else if (itemType === 'folder') {
        // Delete folder and its contents from the database and filesystem
        db.query('SELECT folder_path FROM folders WHERE id = ?', [itemId], (err, result) => {
            if (err) {
                return res.status(500).send('Database error: ' + err.message);
            }
            if (result.length === 0) {
                return res.status(404).send('Folder not found in the database');
            }

            const folderPath = result[0].folder_path;

            // Delete folder and its contents from the filesystem
            fs.rmdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Error deleting folder and its contents from filesystem: ' + err.message);
                }

                // Once folder and its contents are deleted from filesystem, delete its record from the database
                db.query('DELETE FROM folders WHERE id = ?', [itemId], (err, result) => {
                    if (err) {
                        return res.status(500).send('Database error: ' + err.message);
                    }
                    res.send('Folder deleted successfully!');
                });
            });
        });
    } else {
        res.status(400).send('Invalid item type');
    }
});





// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});