const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'semi_digital_archives_secret_key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve static files

// Database connection pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'bantuyenhuan',
  database: process.env.DB_NAME || 'semi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let db;

// Initialize database
async function initializeDatabase() {
  try {
    db = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await db.getConnection();
    console.log('✅ Connected to MySQL database successfully');
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Create database tables
async function createTables() {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Documents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        subcategory VARCHAR(50) DEFAULT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT DEFAULT 0,
        file_type VARCHAR(100) DEFAULT NULL,
        uploaded_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_category (category),
        INDEX idx_subcategory (subcategory),
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables created/verified successfully');
    
    // Create default admin user if not exists
    await createDefaultUser();
    
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
}

// Create default user
async function createDefaultUser() {
  try {
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      ['bantuyenhuan']
    );
    
    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash('12346789', 10);
      await db.query(
        'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['bantuyenhuan', hashedPassword, 'Ban Tuyên Huấn', 'admin']
      );
      console.log('✅ Default admin user created: bantuyenhuan / 12346789');
    }
  } catch (error) {
    console.error('❌ Error creating default user:', error);
  }
}

// Create uploads directory
function createUploadsDirectory() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created');
  }
  
  // Create category subdirectories
  const categories = [
    'tailieu', 'kienthucthuongtruc', 'doituongsqvaqncn', 'doituonghltpd',
    'hasiquanvabinhsi', 'dangvienvadangvienmoi', 'doituongdoanvien',
    'cauhoikienthucgdct', 'cauhoikienthucphapluat'
  ];
  
  categories.forEach(category => {
    const categoryDir = path.join(uploadsDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  });
}

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'general';
    const subcategory = req.body.subcategory || 'general';
    const uploadPath = path.join(__dirname, 'uploads', category, subcategory);
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    cb(null, true);
  }
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const [users] = await db.query(
      'SELECT id, username, password, full_name, role FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route (optional - for creating new users)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, full_name, role = 'user' } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        username,
        name: full_name,
        role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload document
app.post('/api/documents/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, author, category, subcategory } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title || !author || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fileUrl = `/uploads/${category}/${subcategory || 'general'}/${req.file.filename}`;
    const filePath = req.file.path;

    // Save document metadata to database
    const [result] = await db.query(`
      INSERT INTO documents (title, filename, author, category, subcategory, file_url, file_path, file_size, file_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      req.file.originalname,
      author,
      category,
      subcategory || null,
      fileUrl,
      filePath,
      req.file.size,
      req.file.mimetype,
      req.user.id
    ]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: result.insertId,
        title,
        filename: req.file.originalname,
        author,
        category,
        subcategory,
        fileUrl,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get documents by category
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const { category, subcategory, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT d.*, u.full_name as uploader_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;
    let params = [];

    if (category) {
      query += ' AND d.category = ?';
      params.push(category);
    }

    if (subcategory) {
      query += ' AND d.subcategory = ?';
      params.push(subcategory);
    }

    query += ' ORDER BY d.created_at DESC';
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [documents] = await db.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM documents WHERE 1=1';
    let countParams = [];

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (subcategory) {
      countQuery += ' AND subcategory = ?';
      countParams.push(subcategory);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        filename: doc.filename,
        author: doc.author,
        category: doc.category,
        subcategory: doc.subcategory,
        file_url: doc.file_url,
        file_size: doc.file_size,
        file_type: doc.file_type,
        created_at: doc.created_at,
        uploader_name: doc.uploader_name
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single document
app.get('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [documents] = await db.query(
      'SELECT d.*, u.full_name as uploader_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documents[0];

    res.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        author: document.author,
        category: document.category,
        subcategory: document.subcategory,
        file_url: document.file_url,
        file_size: document.file_size,
        file_type: document.file_type,
        created_at: document.created_at,
        uploader_name: document.uploader_name
      }
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download document
app.get('/api/documents/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documents[0];
    const filePath = document.file_path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
    res.setHeader('Content-Type', document.file_type || 'application/octet-stream');

    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document (admin only)
app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin or the uploader
    const { id } = req.params;

    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documents[0];

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== document.uploaded_by) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    await db.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search documents
app.get('/api/documents/search', authenticateToken, async (req, res) => {
  try {
    const { query, category, subcategory, page = 1, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let searchQuery = `
      SELECT d.*, u.full_name as uploader_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE (d.title LIKE ? OR d.author LIKE ? OR d.filename LIKE ?)
    `;
    let params = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (category) {
      searchQuery += ' AND d.category = ?';
      params.push(category);
    }

    if (subcategory) {
      searchQuery += ' AND d.subcategory = ?';
      params.push(subcategory);
    }

    searchQuery += ' ORDER BY d.created_at DESC';
    
    // Add pagination
    const offset = (page - 1) * limit;
    searchQuery += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [documents] = await db.query(searchQuery, params);

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        filename: doc.filename,
        author: doc.author,
        category: doc.category,
        subcategory: doc.subcategory,
        file_url: doc.file_url,
        file_size: doc.file_size,
        file_type: doc.file_type,
        created_at: doc.created_at,
        uploader_name: doc.uploader_name
      })),
      query,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const [docCount] = await db.query('SELECT COUNT(*) as total FROM documents');
    const [userCount] = await db.query('SELECT COUNT(*) as total FROM users');
    const [categoryStats] = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM documents 
      GROUP BY category 
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      stats: {
        totalDocuments: docCount[0].total,
        totalUsers: userCount[0].total,
        categories: categoryStats
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize and start server
async function startServer() {
  try {
    await initializeDatabase();
    createUploadsDirectory();
    
    app.listen(PORT, () => {
      console.log(`🚀 Digital Archives Server running on port ${PORT}`);
      console.log(`📊 API Documentation:`);
      console.log(`   Health: http://192.168.0.109:${PORT}/health`);
      console.log(`   Auth: http://192.168.0.109:${PORT}/api/auth/login`);
      console.log(`   Docs: http://192.168.0.109:${PORT}/api/documents`);
      console.log(`   Upload: http://192.168.0.109:${PORT}/api/documents/upload`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  if (db) {
    await db.end();
    console.log('Database connection closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  if (db) {
    await db.end();
    console.log('Database connection closed');
  }
  process.exit(0);
});

startServer();