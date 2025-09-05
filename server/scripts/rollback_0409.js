// scripts/rollback_0409.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'bantuyenhuan',
  database: process.env.DB_NAME || 'semi',
};

async function rollbackMigration() {
  let connection;
  try {
    // Kết nối
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    console.log('✅ Connected to database:', dbConfig.database);

    // Drop bảng file_system
    await connection.execute(`DROP TABLE IF EXISTS file_system`);
    console.log('🗑️ Dropped table: file_system');

    // Tạo lại bảng documents
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
    console.log('📑 Re-created table: documents');

    console.log('\n🔄 Rollback rollback_0409 completed successfully!');
  } catch (err) {
    console.error('❌ Rollback failed:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run if executed directly
if (require.main === module) {
  rollbackMigration();
}

module.exports = { rollbackMigration };
