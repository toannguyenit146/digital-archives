// scripts/init-database.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'bantuyenhuan',
  database: process.env.DB_NAME || 'semi',
};

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbConfig.database}' created/verified`);

    // Use the database
    await connection.query(`USE \`${dbConfig.database}\``);

    // Create users table
    await connection.execute(`
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

    // Create documents table
    await connection.execute(`
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
        INDEX idx_created_at (created_at),
        FULLTEXT KEY ft_title_author (title, author)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Documents table created/verified');

    // Create sessions table (optional for JWT blacklisting)
    await connection.execute(`
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

    // Create audit log table
    await connection.execute(`
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

    // Check if default admin user exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['bantuyenhuan']
    );

    if (existingUsers.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('12346789', 10);
      await connection.execute(
        'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
        ['bantuyenhuan', hashedPassword, 'Ban Tuyên Huấn', 'admin']
      );
      console.log('✅ Default admin user created: bantuyenhuan / 12346789');
    } else {
      console.log('✅ Default admin user already exists');
    }

    // Create additional sample users
    const sampleUsers = [
      { username: 'user1', password: '123456', fullName: 'Người dùng 1', role: 'user' },
      { username: 'user2', password: '123456', fullName: 'Người dùng 2', role: 'user' },
      { username: 'moderator1', password: '123456', fullName: 'Điều hành viên 1', role: 'moderator' },
    ];

    for (const userData of sampleUsers) {
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [userData.username]
      );

      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await connection.execute(
          'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
          [userData.username, hashedPassword, userData.fullName, userData.role]
        );
        console.log(`✅ Sample user created: ${userData.username} / ${userData.password}`);
      }
    }

    // Create sample documents (optional)
    const [adminUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['bantuyenhuan']
    );

    if (adminUser.length > 0) {
      const adminUserId = adminUser[0].id;
      
      const sampleDocuments = [
        {
          title: 'Tài liệu hướng dẫn sử dụng hệ thống',
          filename: 'huong-dan-su-dung.pdf',
          author: 'Ban Tuyên Huấn',
          category: 'tailieu',
          subcategory: 'lichsu',
          fileUrl: '/uploads/tailieu/lichsu/sample-doc-1.pdf',
          filePath: 'uploads/tailieu/lichsu/sample-doc-1.pdf',
          fileSize: 1024000,
          fileType: 'application/pdf'
        },
        {
          title: 'Nghị quyết số 01/2024 về công tác tuyên truyền',
          filename: 'nghi-quyet-01-2024.docx',
          author: 'Ban Chấp hành',
          category: 'tailieu',
          subcategory: 'nghiquyet',
          fileUrl: '/uploads/tailieu/nghiquyet/sample-doc-2.docx',
          filePath: 'uploads/tailieu/nghiquyet/sample-doc-2.docx',
          fileSize: 512000,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ];

      for (const doc of sampleDocuments) {
        const [existing] = await connection.execute(
          'SELECT id FROM documents WHERE title = ?',
          [doc.title]
        );

        if (existing.length === 0) {
          await connection.execute(`
            INSERT INTO documents (title, filename, author, category, subcategory, file_url, file_path, file_size, file_type, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            doc.title,
            doc.filename,
            doc.author,
            doc.category,
            doc.subcategory,
            doc.fileUrl,
            doc.filePath,
            doc.fileSize,
            doc.fileType,
            adminUserId
          ]);
          console.log(`✅ Sample document created: ${doc.title}`);
        }
      }
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Default Admin: bantuyenhuan / 12346789`);
    console.log(`   Sample Users: user1, user2, moderator1 / 123456`);
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };