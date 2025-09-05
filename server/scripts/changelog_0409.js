// scripts/changelog_0409.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'bantuyenhuan',
  database: process.env.DB_NAME || 'semi',
};

async function runMigration() {
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

    // Drop bảng documents
    await connection.execute(`DROP TABLE IF EXISTS documents`);
    console.log('🗑️ Dropped table: documents');

    // Tạo bảng file_system
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS file_system (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        type ENUM('folder', 'file') NOT NULL,
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
    console.log('📂 Created table: file_system');

    // Lấy id user mặc định
    const [users] = await connection.execute(
      `SELECT id FROM users WHERE username = 'bantuyenhuan' LIMIT 1`
    );
    if (users.length === 0) {
      throw new Error("❌ User 'bantuyenhuan' not found, cannot insert root folders");
    }
    const adminId = users[0].id;

    // Insert root folders
    const rootFolders = [
      { name: 'Tài liệu', category: 'tailieu' },
      { name: 'Kiến thức thường trực', category: 'kienthucthuongtruc' },
      { name: 'Đối tượng SQ và QNCN', category: 'doituongsqvaqncn' },
      { name: 'Đối tượng HL TPD', category: 'doituonghltpd' },
      { name: 'Hạ sĩ quan và binh sĩ', category: 'hasiquanvabinhsi' },
      { name: 'Đảng viên và đảng viên mới', category: 'dangvienvadangvienmoi' },
      { name: 'Đối tượng đoàn viên', category: 'doituongdoanvien' },
      { name: 'Câu hỏi kiến thức GDCT', category: 'cauhoikienthucgdct' },
      { name: 'Câu hỏi kiến thức pháp luật', category: 'cauhoikienthucphapluat' },
    ];

    for (const folder of rootFolders) {
      const path = `/${folder.name}`;
      await connection.execute(
        `INSERT INTO file_system (name, type, parent_id, path, category, uploaded_by)
         VALUES (?, 'folder', NULL, ?, ?, ?)`,
        [folder.name, path, folder.category, adminId]
      );
      console.log(`📁 Inserted root folder: ${folder.name}`);
    }

    console.log('\n🎉 Migration changelog_0409 completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run if executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
