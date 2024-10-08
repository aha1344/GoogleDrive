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
    if (req.session.userId) { // Check if user session exists
        res.redirect('/index'); // Redirect to homepage
    } else {
        res.sendFile(path.join(__dirname, 'views', 'signin.html'));
    }
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
            archive.directory(folderPath, false);
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
});

app.post('/move-to-trash', (req, res) => {
});

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
    const { email, password, rememberMe } = req.body;
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
                    if (rememberMe) {
                        const oneWeek = 7 * 24 * 3600 * 1000; // one week
                        req.session.cookie.maxAge = oneWeek; // Extend session cookie lifetime
                    }
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

app.get('/get-file-size', function (req, res) {
    const fileId = req.query.fileId; // Assuming the file ID is passed as a query parameter

    if (!fileId) {
        return res.status(400).send('File ID is required');
    }

    const sql = 'SELECT file_size FROM files WHERE id = ?';
    db.query(sql, [fileId], function (err, results) {
        if (err) {
            return res.status(500).send('Database error: ' + err.message);
        }
        if (results.length === 0) {
            return res.status(404).send('File not found');
        }
        res.json({ fileSize: results[0].file_size });
    });
});
app.get('/get-folder-size', function (req, res) {
    const folderId = req.query.folderId; 

    if (!folderId) {
        return res.status(400).send('Folder ID is required');
    }

    const sql = `
        SELECT SUM(file_size) AS total_size
        FROM files
        WHERE folder_id = ?
    `;
    db.query(sql, [folderId], function (err, results) {
        if (err) {
            return res.status(500).send('Database error: ' + err.message);
        }
        if (results.length === 0 || results[0].total_size === null) {
            return res.status(404).send('Folder not found or empty');
        }
        res.json({ folderId: folderId, totalSize: results[0].total_size });
    });
});


// File upload route
app.post('/upload', upload.single('file'), function (req, res) {
    const userId = req.session.userId; 
    const file = req.file;
    if (!file) {
        return res.status(400).send('Please upload a file.');
    }
    const userDir = `uploads/`; 
    const filePath = `${userDir}/${file.originalname}`;
    const fileSize = file.size; // Get the size of the file from the Multer file object

    const insertSql = 'INSERT INTO files (user_id, file_name, file_path, file_size, upload_date) VALUES (?, ?, ?, ?, NOW())';
    db.query(insertSql, [userId, file.originalname, filePath, fileSize], (err, result) => {
        if (err) {
            return res.status(500).send('Database error: ' + err.message);
        }
        res.send('File uploaded successfully!');
    });
});



app.get('/get-user-files', function (req, res) {
    const userId = req.session.userId; 
    const searchQuery = req.query.query || ''; 

    // Modify the SQL query
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
    const userId = req.session.userId; 
    const searchQuery = req.query.query || ''; 

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
        db.query('SELECT folder_path FROM folders WHERE id = ?', [itemId], (err, result) => {
            if (err) {
                return res.status(500).send('Database error: ' + err.message);
            }
            if (result.length === 0) {
                return res.status(404).send('Folder not found in the database');
            }

            const folderPath = result[0].folder_path;

            fs.rmdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    return res.status(500).send('Error deleting folder and its contents from filesystem: ' + err.message);
                }

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


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});