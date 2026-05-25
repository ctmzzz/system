const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_CONFIG = {
    host: '192.168.3.6',
    port: 3306,
    user: 'root',
    password: 'Saodiseng1',
    database: 'score_analysis',
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 100,
    decimalNumbers: true,  // 让 DECIMAL 返回数字而非字符串
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

let pool = null;

function normalizeSQL(sql) {
    return sql
        .replace(/CAST\s*\(\s*(\S[^)]*?)\s+AS\s+INTEGER\s*\)/gi, 'CAST($1 AS SIGNED)')
        .replace(/CAST\s*\(\s*(\S[^)]*?)\s+AS\s+REAL\s*\)/gi, 'CAST($1 AS DECIMAL(10,2))')
        .replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
        .replace(/last_insert_rowid\(\)/gi, 'LAST_INSERT_ID()')
        // 给作为别名的 rank 加反引号（MySQL 保留字）
        .replace(/\bas\s+rank\b/gi, 'as `rank`');
}

async function initDatabase() {
    const initConn = await mysql.createConnection({
        host: DB_CONFIG.host, port: DB_CONFIG.port,
        user: DB_CONFIG.user, password: DB_CONFIG.password
    });
    await initConn.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await initConn.end();

    pool = mysql.createPool(DB_CONFIG);
    console.log('MySQL 连接成功 (127.0.0.1)');

    await createAllTables();

    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM users');
    if (rows[0].count === 0) {
        const hp = bcrypt.hashSync('admin123', 10);
        await pool.execute('INSERT INTO users (employee_id, password, name, role) VALUES (?, ?, ?, ?)', ['admin', hp, '管理员', 'admin']);
        console.log('已创建默认管理员账号: admin / admin123');
    }
    console.log('数据库初始化完成');
}

async function createAllTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, employee_id VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, plain_password VARCHAR(255), name VARCHAR(100) NOT NULL, role VARCHAR(20) DEFAULT 'teacher') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS classes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, grade VARCHAR(50) DEFAULT '', user_id INT, created_by VARCHAR(100) DEFAULT '') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY, student_id VARCHAR(50) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL, class_id INT, user_id INT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS exams (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200) NOT NULL, date VARCHAR(20) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS scores (id INT AUTO_INCREMENT PRIMARY KEY, exam_id INT NOT NULL, student_id INT NOT NULL, subject VARCHAR(100) DEFAULT '', total_score DECIMAL(10,2) NOT NULL, user_id INT, UNIQUE KEY uq_exam_student_subject (exam_id, student_id, subject)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS beauty_scores (id INT AUTO_INCREMENT PRIMARY KEY, class_id INT NOT NULL, student_id VARCHAR(50) NOT NULL, row_index INT NOT NULL, month VARCHAR(20) DEFAULT '', score DECIMAL(10,2) DEFAULT 0, events TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, user_id INT, entry_date VARCHAR(20) DEFAULT '', UNIQUE KEY uq_beauty (class_id, student_id, row_index, month)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS beauty_events (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200) NOT NULL, type VARCHAR(20) DEFAULT '扣学分', default_score DECIMAL(10,2) DEFAULT 1, category_index INT, item_index INT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS attendance (id INT AUTO_INCREMENT PRIMARY KEY, class_id INT NOT NULL, student_id INT NOT NULL, date VARCHAR(20) NOT NULL, status VARCHAR(20) DEFAULT 'present', remark TEXT, late_time VARCHAR(50) DEFAULT '', leave_time VARCHAR(50) DEFAULT '', leave_type VARCHAR(50) DEFAULT '', leave_with_note VARCHAR(10) DEFAULT '0', leave_duration VARCHAR(50) DEFAULT '', absent_time VARCHAR(50) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_attendance (class_id, student_id, date)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS beauty_score_events (id INT AUTO_INCREMENT PRIMARY KEY, class_id INT NOT NULL, student_id VARCHAR(50) NOT NULL, row_index INT NOT NULL, month VARCHAR(20) NOT NULL, score DECIMAL(10,2) DEFAULT 0, event_name VARCHAR(200) DEFAULT '', entry_date VARCHAR(20) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, content TEXT NOT NULL, start_date VARCHAR(20) DEFAULT '', end_date VARCHAR(20) DEFAULT '', is_active TINYINT(1) DEFAULT 1, created_by VARCHAR(100) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS homework (id INT AUTO_INCREMENT PRIMARY KEY, semester VARCHAR(50) NOT NULL, subject VARCHAR(100) NOT NULL, content TEXT, class_id INT DEFAULT NULL, created_by VARCHAR(100) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uq_homework (semester, subject, class_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS homework_data (id INT AUTO_INCREMENT PRIMARY KEY, semester VARCHAR(50) NOT NULL, class_id INT NOT NULL, subject VARCHAR(100) NOT NULL, date VARCHAR(20) NOT NULL, student_id INT NOT NULL, submitted TINYINT(1) DEFAULT 0, late TINYINT(1) DEFAULT 0, created_by VARCHAR(100) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uq_homework_data (semester, class_id, subject, date, student_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS teacher_course_hours (id INT AUTO_INCREMENT PRIMARY KEY, teacher_employee_id VARCHAR(50) DEFAULT '', teacher_name VARCHAR(100) NOT NULL, subject VARCHAR(100) DEFAULT '', class_name VARCHAR(100) DEFAULT '', course_date VARCHAR(20) DEFAULT '', weekday VARCHAR(20) DEFAULT '', period_no VARCHAR(50) DEFAULT '', hours DECIMAL(10,2) DEFAULT 1, source_file VARCHAR(255) DEFAULT '', imported_by VARCHAR(100) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_tch_teacher (teacher_employee_id, teacher_name), INDEX idx_tch_date (course_date), INDEX idx_tch_subject (subject)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS substitute_teachers (id INT AUTO_INCREMENT PRIMARY KEY, teacher_name VARCHAR(100) NOT NULL UNIQUE, can_substitute TINYINT(1) DEFAULT 1, current_assignments TEXT, source_file VARCHAR(255) DEFAULT '', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS substitute_requests (id INT AUTO_INCREMENT PRIMARY KEY, activity_type VARCHAR(50) DEFAULT '社团', course_name VARCHAR(200) DEFAULT '', course_date VARCHAR(20) DEFAULT '', original_teacher VARCHAR(100) NOT NULL, substitute_teacher VARCHAR(100) NOT NULL, reason VARCHAR(255) DEFAULT '', notes TEXT, requested_by VARCHAR(100) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_sub_date (course_date), INDEX idx_sub_teacher (substitute_teacher), INDEX idx_sub_original (original_teacher)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS club_activity_sessions (id INT AUTO_INCREMENT PRIMARY KEY, activity_type VARCHAR(50) DEFAULT '社团', course_name VARCHAR(200) DEFAULT '', course_date VARCHAR(20) DEFAULT '', scheduled_teacher VARCHAR(100) DEFAULT '', substitute_teacher VARCHAR(100) DEFAULT '', source_file VARCHAR(255) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_club_session (course_date, course_name, scheduled_teacher), INDEX idx_club_date (course_date), INDEX idx_club_course (course_name), INDEX idx_club_teacher (scheduled_teacher)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];
    for (const sql of tables) {
        await pool.execute(normalizeSQL(sql));
    }
    console.log('所有表创建完成');
    // 补缺失列
    try { await pool.execute("ALTER TABLE users ADD COLUMN plain_password VARCHAR(255)"); } catch(e) {}
    try { await pool.execute("ALTER TABLE attendance ADD COLUMN absent_time VARCHAR(50) DEFAULT ''"); } catch(e) {}
    try { await pool.execute("ALTER TABLE homework ADD COLUMN class_id INT DEFAULT NULL"); } catch(e) {}
    try { await pool.execute("ALTER TABLE homework DROP INDEX uq_homework"); } catch(e) {}
    try { await pool.execute("ALTER TABLE homework ADD UNIQUE KEY uq_homework (semester, subject, class_id)"); } catch(e) {}
    try { await pool.execute("ALTER TABLE homework_data ADD COLUMN late TINYINT(1) DEFAULT 0"); } catch(e) {}
    try { await pool.execute("ALTER TABLE teacher_course_hours ADD COLUMN source_file VARCHAR(255) DEFAULT ''"); } catch(e) {}
    try { await pool.execute("ALTER TABLE teacher_course_hours ADD COLUMN imported_by VARCHAR(100) DEFAULT ''"); } catch(e) {}
    try { await pool.execute("ALTER TABLE substitute_teachers ADD COLUMN current_assignments TEXT"); } catch(e) {}
    try { await pool.execute("ALTER TABLE substitute_requests ADD COLUMN notes TEXT"); } catch(e) {}
    try { await pool.execute("ALTER TABLE club_activity_sessions ADD COLUMN substitute_teacher VARCHAR(100) DEFAULT ''"); } catch(e) {}
    try { await pool.execute("ALTER TABLE club_activity_sessions ADD COLUMN source_file VARCHAR(255) DEFAULT ''"); } catch(e) {}
}

// 异步数据库操作
const database = {
    async all(sql, params = []) {
        try {
            const [rows] = await pool.execute(normalizeSQL(sql), params);
            return rows;
        } catch (e) { console.error('DB all:', e.message); return []; }
    },
    async get(sql, params = []) {
        try {
            const [rows] = await pool.execute(normalizeSQL(sql), params);
            return rows.length > 0 ? rows[0] : null;
        } catch (e) { console.error('DB get:', e.message); return null; }
    },
    async run(sql, params = []) {
        const [result] = await pool.execute(normalizeSQL(sql), params);
        return { lastInsertRowid: result.insertId };
    },
    async exec(sql) {
        await pool.execute(normalizeSQL(sql));
    },
    async transaction(fn) {
        const conn = await pool.getConnection();
        const origRun = this.run;
        const origAll = this.all;
        const origGet = this.get;
        const origExec = this.exec;
        const restore = () => { this.run = origRun; this.all = origAll; this.get = origGet; this.exec = origExec; };
        // 临时替换为连接绑定版本
        this.run = async (sql, p) => { try { const [r] = await conn.execute(normalizeSQL(sql), p||[]); return {lastInsertRowid:r.insertId}; } catch(e){return {lastInsertRowid:0};} };
        this.all = async (sql, p) => { try { const [r] = await conn.execute(normalizeSQL(sql), p||[]); return r; } catch(e){return [];} };
        this.get = async (sql, p) => { try { const [r] = await conn.execute(normalizeSQL(sql), p||[]); return r[0]||null; } catch(e){return null;} };
        this.exec = async (sql) => { await conn.execute(normalizeSQL(sql)); };
        try {
            await conn.query('START TRANSACTION');
            await fn();
            await conn.query('COMMIT');
        } catch (err) {
            await conn.query('ROLLBACK');
            throw err;
        } finally {
            restore();
            conn.release();
        }
    }
};

module.exports = { initDatabase, database };
