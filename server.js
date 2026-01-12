import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 1. USER AUTHENTICATION ROUTES ---

// Registration: Saves new users to the 'users' table
app.post('/api/users/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    const checkUser = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUser, [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) return res.status(400).json({ error: 'Email already registered.' });

        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(sql, [name, email, password], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: '✅ Registration successful', id: result.insertId });
        });
    });
});

// Login: Verifies users from the 'users' table
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });
        
        // In a real app, you would send a token here. For now, we send user data.
        res.json({ message: '✅ Login successful', user: results[0] });
    });
});

// --- 2. SKILL ECONOMY ROUTES ---

// GET all skills: Pulls every skill from 'skills' table for search-results.html
app.get('/api/skills', (req, res) => {
    const sql = 'SELECT * FROM skills ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST a new skill: Saves form data from list-skill.html to 'skills' table
app.post('/api/skills', (req, res) => {
    const { user_id, title, category, proficiency, description, seeking } = req.body;
    const sql = `INSERT INTO skills (user_id, title, category, proficiency, description, seeking) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [user_id, title, category, proficiency, description, seeking], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '✅ Skill successfully listed', id: result.insertId });
    });
});

// --- 3. SERVING THE FRONTEND ---

// Redirects the base URL to your Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`
    🌟 AuraConnect Backend is Running!
    ----------------------------------
    📍 Local URL: http://localhost:${PORT}
    📂 Frontend Folder: /public
    🗄️ Database: Connected to auraconnect_db
    `);
});