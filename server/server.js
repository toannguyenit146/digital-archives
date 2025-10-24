const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { initializeDatabase } = require("./scripts/init-database");

const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, './scripts/data/categories.json'), 'utf-8')
);
const subcategories = JSON.parse(
  fs.readFileSync(path.join(__dirname, './scripts/data/subcategories.json'), 'utf-8')
);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const os = require('os');

const nets = os.networkInterfaces();
let serverIp = '';

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      serverIp = net.address;
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve static files

// Database connection pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || '3307',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.DB_NAME || 'semi_be',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let db;

// Initialize database
async function setupDatabase() {
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
    initializeDatabase();
    console.log('✅ Database tables created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
}

// Create uploads directory
function createUploadsDirectory() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created');
  }
  
  categories.forEach(category => {
    const categoryDir = path.join(uploadsDir, category.title);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  });
}

// Create uploads subdirectories
function createUploadsSubdirectories() {
  const baseDir = path.join(__dirname, 'uploads', 'Tài liệu');
  subcategories.forEach(subDir => {
    const fullPath = path.join(baseDir, subDir.title);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created uploads subdirectory: ${fullPath}`);
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
  destination: async (req, file, cb) => {
    try {
      const parentId = req.query.parent_id;
      let uploadPath;
      
      if (parentId) {
        // Get parent folder path
        const [parentFolder] = await db.query(
          'SELECT path, category FROM file_system WHERE id = ? AND type = "folder"',
          [parentId]
        );
        
        if (parentFolder.length > 0) {
          const folderPath = parentFolder[0].path.replace(/^\//, '');
          uploadPath = path.join(__dirname, 'uploads', folderPath);
        } else {
          uploadPath = path.join(__dirname, 'uploads', 'general');
        }
      } else {
        uploadPath = path.join(__dirname, 'uploads', 'general');
      }
      
      // Create directory if it doesn't exist
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
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

// Utility function to build full path
async function buildFullPath(parentId) {
  if (!parentId) return '/';
  
  const pathParts = [];
  let currentId = parentId;
  
  while (currentId) {
    const [folder] = await db.query(
      'SELECT name, parent_id FROM file_system WHERE id = ?',
      [currentId]
    );
    
    if (folder.length === 0) break;
    
    pathParts.unshift(folder[0].name);
    currentId = folder[0].parent_id;
  }
  
  return '/' + pathParts.join('/');
}

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

// FILE SYSTEM ROUTES

// Get Main Categories
app.get('/api/file-system/main-categories', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT id, name, filename, title, author, file_url, file_path, file_size, category FROM file_system` +
      ` WHERE parent_id IS NULL AND type = "folder" ORDER BY file_size ASC`
    );
    res.json({
      success: true,
      categories: categories.map(cat => ({
        id: cat.id,
        title: cat.name,
        color: cat.title,
        icon: cat.author,
        description: cat.filename,
        hasSubcategories: cat.file_url,
        allowUpload: cat.file_path,
        keyName: cat.category
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subcategories of Tai lieu
app.get('/api/file-system/sub-categories-document', async (req, res) => {
  try {
    const [subcategories] = await db.query(
      `SELECT id, name, filename, title, author, file_size, parent_id FROM file_system WHERE 
      parent_id =(SELECT id FROM file_system fs WHERE fs.parent_id IS NULL AND fs.file_url = 'true')
      AND type = "folder" AND category = "tailieu" ORDER BY file_size ASC`
    );
    res.json({
      success: true,
      subcategories: subcategories.map(sub => ({
        id: sub.id,
        title: sub.name,
        icon: sub.author,
        description: sub.filename,
        parentId: sub.parent_id,
        keyName: sub.title,
      }))
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get folder contents
app.get('/api/file-system/contents', authenticateToken, async (req, res) => {
  try {
    const { parent_id, category, subcategory } = req.query;
    
    let query = `
      SELECT fs.*, u.full_name as uploader_name
      FROM file_system fs
      LEFT JOIN users u ON fs.uploaded_by = u.id
      WHERE 1=1
    `;
    let params = [];
    console.log(parent_id, category, subcategory);
    if (parent_id) {
      query += ' AND fs.parent_id = ?';
      params.push(parent_id);
    } else {
      query += ' AND fs.parent_id IS NULL';
    }

    if (category) {
      query += ' AND fs.category = ?';
      params.push(category);
    }

    if (subcategory) {
      query += ' AND fs.subcategory = ?';
      params.push(subcategory);
    }

    query += ' ORDER BY fs.type DESC, fs.name ASC'; // Folders first, then files

    const [items] = await db.query(query, params);

    res.json({
      success: true,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        parent_id: item.parent_id,
        path: item.path,
        filename: item.filename,
        title: item.title,
        author: item.author,
        file_url: item.file_url,
        file_size: item.file_size,
        file_type: item.file_type,
        category: item.category,
        subcategory: item.subcategory,
        created_at: item.created_at,
        uploader_name: item.uploader_name
      }))
    });

  } catch (error) {
    console.error('Get folder contents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get breadcrumb path
app.get('/api/file-system/breadcrumb', authenticateToken, async (req, res) => {
  try {
    const { folder_id } = req.query;
    
    if (!folder_id) {
      return res.json({ success: true, breadcrumb: [] });
    }

    const breadcrumb = [];
    let currentId = folder_id;

    while (currentId) {
      const [folder] = await db.query(
        'SELECT id, name, parent_id, path FROM file_system WHERE id = ? AND type = "folder"',
        [currentId]
      );

      if (folder.length === 0) break;

      breadcrumb.unshift({
        id: folder[0].id,
        name: folder[0].name,
        path: folder[0].path
      });

      currentId = folder[0].parent_id;
    }

    res.json({
      success: true,
      breadcrumb
    });

  } catch (error) {
    console.error('Get breadcrumb error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create folder
app.post('/api/file-system/folder', authenticateToken, async (req, res) => {
  try {
    const { name, parent_id, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Check if folder with same name exists in same parent
    const [existing] = await db.query(
      'SELECT id FROM file_system WHERE name = ? AND parent_id = ? AND type = "folder"',
      [name.trim(), parent_id || null]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Folder with this name already exists' });
    }

    // Build full path
    const fullPath = await buildFullPath(parent_id) + (parent_id ? '/' : '') + name.trim();

    // Get category from parent if not provided
    let folderCategory = category;
    let folderSubcategory = null;
    if (!folderCategory && parent_id) {
      const [parent] = await db.query(
        'SELECT category FROM file_system WHERE id = ?',
        [parent_id]
      );
      if (parent.length > 0) {
        folderCategory = parent[0].category;
        folderSubcategory = parent[0].subcategory;
      }
    }

    const [result] = await db.query(`
      INSERT INTO file_system (name, type, parent_id, path, category, subcategory, uploaded_by)
      VALUES (?, 'folder', ?, ?, ?, ?, ?)
    `, [name.trim(), parent_id || null, fullPath, folderCategory, folderSubcategory, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: {
        id: result.insertId,
        name: name.trim(),
        type: 'folder',
        parent_id: parent_id || null,
        path: fullPath,
        category: folderCategory
      }
    });

  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload file to folder
app.post('/api/file-system/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, author } = req.body;
    const { parent_id } = req.query;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    // Get parent folder info
    let parentCategory = null;
    let parentPath = '/';
    let parentSubcategory = null;
    
    if (parent_id) {
      const [parent] = await db.query(
        'SELECT category, path FROM file_system WHERE id = ? AND type = "folder"',
        [parent_id]
      );
      
      if (parent.length > 0) {
        parentCategory = parent[0].category;
        parentPath = parent[0].path;
        parentSubcategory = parent[0].subcategory;
      }
    }

    // Build file URL relative to uploads
    const relativePath = path.relative(
      path.join(__dirname, 'uploads'),
      req.file.path
    ).replace(/\\/g, '/');
    const fileUrl = `/uploads/${relativePath}`;

    // Build full path for file
    const fullPath = parentPath + (parentPath.endsWith('/') ? '' : '/') + req.file.originalname;

    // Save file metadata to database
    const [result] = await db.query(`
      INSERT INTO file_system (name, type, parent_id, path, filename, author, 
                               file_url, file_path, file_size, file_type, category, subcategory, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.file.originalname,
      'file',
      parent_id || null,
      fullPath,
      title,
      author,
      fileUrl,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      parentCategory,
      parentSubcategory,
      req.user.id
    ]);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: result.insertId,
        name: req.file.originalname,
        type: 'file',
        title,
        author,
        fileUrl,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rename file or folder
app.patch('/api/file-system/:id/rename', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Get current item
    const [items] = await db.query(
      'SELECT * FROM file_system WHERE id = ?',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = items[0];

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== item.uploaded_by) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Check if name already exists in same parent
    const [existing] = await db.query(
      'SELECT id FROM file_system WHERE name = ? AND parent_id = ? AND type = ? AND id != ?',
      [name.trim(), item.parent_id, item.type, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Item with this name already exists' });
    }

    // Update name and rebuild path
    const newPath = item.path.replace(/\/[^\/]+$/, '/' + name.trim());

    await db.query(
      'UPDATE file_system SET name = ?, path = ? WHERE id = ?',
      [name.trim(), newPath, id]
    );

    // If it's a folder, update all children paths
    if (item.type === 'folder') {
      const [children] = await db.query(
        'SELECT id, path FROM file_system WHERE path LIKE ?',
        [item.path + '/%']
      );

      for (const child of children) {
        const newChildPath = child.path.replace(item.path, newPath);
        await db.query(
          'UPDATE file_system SET path = ? WHERE id = ?',
          [newChildPath, child.id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Item renamed successfully'
    });

  } catch (error) {
    console.error('Rename error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete file or folder
app.delete('/api/file-system/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get item
    const [items] = await db.query(
      'SELECT * FROM file_system WHERE id = ?',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = items[0];

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== item.uploaded_by) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // If it's a file, delete from filesystem
    if (item.type === 'file' && item.file_path && fs.existsSync(item.file_path)) {
      fs.unlinkSync(item.file_path);
    }

    // If it's a folder, delete all files in it from filesystem
    if (item.type === 'folder') {
      const [childFiles] = await db.query(
        'SELECT file_path FROM file_system WHERE path LIKE ? AND type = "file" AND file_path IS NOT NULL',
        [item.path + '/%']
      );

      for (const childFile of childFiles) {
        if (fs.existsSync(childFile.file_path)) {
          fs.unlinkSync(childFile.file_path);
        }
      }
    }

    // Delete from database (CASCADE will handle children)
    await db.query('DELETE FROM file_system WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download file
app.get('/api/file-system/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await db.query(
      'SELECT * FROM file_system WHERE id = ? AND type = "file"',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = items[0];

    // Check if file exists
    if (!file.file_path || !fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename || file.name}"`);
    res.setHeader('Content-Type', file.file_type || 'application/octet-stream');

    // Stream file to response
    const fileStream = fs.createReadStream(file.file_path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const [fileCount] = await db.query('SELECT COUNT(*) as total FROM file_system WHERE type = "file"');
    const [folderCount] = await db.query('SELECT COUNT(*) as total FROM file_system WHERE type = "folder"');
    const [userCount] = await db.query('SELECT COUNT(*) as total FROM users');
    const [categoryStats] = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM file_system 
      WHERE type = 'file' AND category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      stats: {
        totalFiles: fileCount[0].total,
        totalFolders: folderCount[0].total,
        totalUsers: userCount[0].total,
        categories: categoryStats
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search files/folders
app.get('/api/file-system/search', authenticateToken, async (req, res) => {
  try {
    const { query, category, fileType } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // FULLTEXT search cho name, title, author + fallback LIKE
    let sql = `
      SELECT fs.*, u.full_name as uploader_name
      FROM file_system fs
      LEFT JOIN users u ON fs.uploaded_by = u.id
      WHERE (MATCH(fs.name, fs.title, fs.author) AGAINST(? IN BOOLEAN MODE)
             OR fs.name LIKE ? OR fs.title LIKE ? OR fs.author LIKE ?)
    `;
    const params = [query + '*', `%${query}%`, `%${query}%`, `%${query}%`];

    if (category) {
      sql += ' AND fs.category = ?';
      params.push(category);
    }

    if (fileType) {
      // Cho phép tìm "pdf", "doc", "image"…
      sql += ' AND fs.file_type LIKE ?';
      params.push(`%${fileType}%`);
    }

    sql += ' ORDER BY fs.type DESC, fs.name ASC';

    const [results] = await db.query(sql, params);

    res.json({
      success: true,
      documents: results.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        path: item.path,
        title: item.title,
        author: item.author,
        file_size: item.file_size,
        file_type: item.file_type,
        category: item.category,
        subcategory: item.subcategory,
        created_at: item.created_at,
        uploader_name: item.uploader_name
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
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
    await setupDatabase();
    createUploadsDirectory();
    createUploadsSubdirectories();
    
    app.listen(PORT, () => {
      console.log(`🚀 Digital Archives Server running on port ${PORT}`);
      console.log(`📊 API Documentation:`);
      console.log(`   Health: http://${serverIp}:${PORT}/health`);
      console.log(`   Auth: http://${serverIp}:${PORT}/api/auth/login`);
      console.log(`   File System: http://${serverIp}:${PORT}/api/file-system/contents`);
      console.log(`   Upload: http://${serverIp}:${PORT}/api/file-system/upload`);
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