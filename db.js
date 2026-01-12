import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Default XAMPP user
    password: '',      // Default XAMPP password is empty
    database: 'auraconnect_db' 
});

db.connect((err) => {
    if (err) {
        console.error('❌ MySQL Connection Error:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL Database');
});

export default db;