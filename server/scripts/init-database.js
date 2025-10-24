// scripts/init-database.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'bantuyenhuan',
  database: process.env.DB_NAME || 'semi_be',
};

// Load categories và subcategories
console.log(__dirname)
const categories = JSON.parse(
  fs.readFileSync(path.join(__dirname, './data/categories.json'), 'utf-8')
);
const subcategories = JSON.parse(
  fs.readFileSync(path.join(__dirname, './data/subcategories.json'), 'utf-8')
);

async function initializeDatabase() {
  let connection;
  try {
    // Connect to MySQL server
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    console.log('✅ Connected to MySQL server');

    // Create database if not exists
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log(`✅ Database '${dbConfig.database}' created/verified`);

    // Use database
    await connection.query(`USE \`${dbConfig.database}\``);

    // ---------------- Users table ----------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created/verified');

    // ---------------- File System table ----------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS file_system (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        type ENUM('folder','file') NOT NULL,
        parent_id VARCHAR(36) DEFAULT NULL,
        path VARCHAR(1000) NOT NULL,
        filename VARCHAR(255) DEFAULT NULL,
        title VARCHAR(255) DEFAULT NULL,
        author VARCHAR(100) DEFAULT NULL,
        file_url VARCHAR(500) DEFAULT NULL,
        file_path VARCHAR(500) DEFAULT NULL,
        file_size BIGINT DEFAULT 0,
        file_type VARCHAR(100) DEFAULT NULL,
        category VARCHAR(50) DEFAULT NULL,
        subcategory VARCHAR(50) DEFAULT NULL,
        uploaded_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES file_system(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_parent_id (parent_id),
        INDEX idx_type (type),
        INDEX idx_path (path(255)),
        INDEX idx_category (category),
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_name (name),
        FULLTEXT KEY ft_name_title_author (name, title, author)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ File system table created/verified');

    // ---------------- User Sessions table ----------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ User sessions table created/verified');

    // ---------------- Audit Logs table ----------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36),
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(36),
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_resource_type (resource_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Audit logs table created/verified');

    // ---------------- Default Admin User ----------------
    const [admin] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      ['bantuyenhuan']
    );
    if (admin.length === 0) {
      const hashedPassword = await bcrypt.hash('12346789', 10);
      await connection.query(
        'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['bantuyenhuan', hashedPassword, 'Ban Tuyên Huấn', 'admin']
      );
      console.log('✅ Default admin user created: bantuyenhuan / 12346789');
    }

    // ---------------- Sample Users ----------------
    const sampleUsers = [
      { username: 'user1', password: '123456', fullName: 'Người dùng 1', role: 'user' },
      { username: 'user2', password: '123456', fullName: 'Người dùng 2', role: 'user' },
      { username: 'moderator1', password: '123456', fullName: 'Điều hành viên 1', role: 'moderator' },
    ];
    for (const u of sampleUsers) {
      const [ex] = await connection.query('SELECT id FROM users WHERE username=?', [u.username]);
      if (ex.length === 0) {
        const hashed = await bcrypt.hash(u.password, 10);
        await connection.query(
          'INSERT INTO users (username,password,full_name,role) VALUES (?,?,?,?)',
          [u.username, hashed, u.fullName, u.role]
        );
        console.log(`✅ Sample user created: ${u.username} / ${u.password}`);
      }
    }

    // ---------------- Root Folders ----------------
    const [adminUser] = await connection.query(
      'SELECT id FROM users WHERE username=? LIMIT 1',
      ['bantuyenhuan']
    );
    if (adminUser.length > 0) {
      const adminId = adminUser[0].id;
      const rootFolders = categories;
      for (const [i, f] of rootFolders.entries()) {
        const [exist] = await connection.query(
          'SELECT id FROM file_system WHERE id=? AND name=? AND parent_id IS NULL AND category=?',
          [f.id, f.title, f.category]
        );
        if (exist.length === 0) {
          await connection.query(
            `INSERT INTO file_system (id,name,type,parent_id,path,category,uploaded_by,filename,title,author,file_url,file_path,file_size) ` +
            `VALUES (?, ?, "folder", NULL, ?, ?, ?, ?, ?,?, ?, ?, ?)`,
            [f.id, f.title, `/${f.title}`, f.keyName, adminId, f.description, f.color, f.icon, f.hasSubcategories, f.allowUpload, i + 1]
          );
        }
      }
      console.log('✅ Root folders created/verified');

      // ---------------- Subfolders for "Tài liệu" ----------------
      const [tailieuRoot] = await connection.query(
        'SELECT id FROM file_system WHERE name=? AND parent_id IS NULL AND category=?',
        ['Tài liệu', 'tailieu']
      );
      if (tailieuRoot.length > 0) {
        const rootId = tailieuRoot[0].id;
        const subFolders = subcategories;
        for (const [i, sf] of subFolders.entries()) {
          const [exist] = await connection.query(
            'SELECT id FROM file_system WHERE name=? AND parent_id=? AND category=?',
            [sf.title, rootId, 'tailieu']
          );
          if (exist.length === 0) {
            await connection.query(
              `INSERT INTO file_system (id,name,type,parent_id,path,category,subcategory,uploaded_by,filename,title,author,file_size) ` + 
              `VALUES (?, ?, "folder", ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [sf.id, sf.title, rootId, `/Tài liệu/${sf.title}`, 'tailieu', sf.keyName, adminId, sf.description, sf.keyName, sf.icon, i + 1]
            );
          }
        }
        console.log('✅ Subfolders for "Tài liệu" created/verified');
      }
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Default Admin: bantuyenhuan / 12346789`);
    console.log(`   Sample Users: user1, user2, moderator1 / 123456`);

  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// if (require.main === module) {
//   initializeDatabase();
// }

module.exports = { initializeDatabase };
