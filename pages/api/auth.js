// pages/api/login.js
import mysql from 'mysql2/promise';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

// Use require for wordpress-hash-node (works reliably in Next API routes)
const hasher = require('wordpress-hash-node');

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key';
// If your WP tables use a different prefix than "fxiEe_", set WP_TABLE_PREFIX in .env
const WP_PREFIX = process.env.WP_TABLE_PREFIX || 'fxiEe_';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { isLogin, name, email, phone, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        });

        // ----- LOGIN -----
        if (isLogin) {
            const [rows] = await conn.execute(
                `SELECT * FROM \`${WP_PREFIX}users\` WHERE user_email = ? LIMIT 1`,
                [email]
            );


            if (!rows || rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const user = rows[0];

            // Verify WP-style hash using wordpress-hash-node
            const ok = hasher.CheckPassword(password, user.user_pass);
            if (!ok) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Optional: check role before issuing token (uncomment if you want)
            // const [capsRows] = await conn.execute(
            //   'SELECT meta_value FROM ?? WHERE user_id = ? AND meta_key = ? LIMIT 1',
            //   [`${WP_PREFIX}usermeta`, user.ID, `${WP_PREFIX}capabilities`]
            // );
            // if (capsRows.length && !JSON.parse(capsRows[0].meta_value).customer) {
            //   return res.status(403).json({ success:false, message: 'Not allowed to login from this app' });
            // }

            // create JWT
            const token = jwt.sign({ id: user.ID, email: user.user_email }, SECRET_KEY, { expiresIn: '1h' });
            res.setHeader('Set-Cookie', serialize('session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60,
                path: '/',
            }));

            return res.json({ success: true, message: 'Login successful' });
        }

        // ----- SIGNUP -----
        // prevent duplicate email
        // prevent duplicate email
        const [existing] = await conn.execute(
            `SELECT ID FROM \`${WP_PREFIX}users\` WHERE user_email = ? LIMIT 1`,
            [email]
        );
        if (existing && existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Hash password using WordPress algorithm
        const wpHash = hasher.HashPassword(password);
        const nickname = name 
        const displayName = name || email.split('@')[0];

        // Insert user into users table
        const [result] = await conn.execute(
            `INSERT INTO \`${WP_PREFIX}users\`
   (user_login, user_pass, user_email, user_registered, display_name)
   VALUES (?, ?, ?, NOW(), ?)`,
            [email, wpHash, email, displayName]
        );

        const userId = result.insertId;

        if(nickname) {
            await conn.execute(
                `INSERT INTO \`${WP_PREFIX}usermeta\` (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
                [userId, 'nickname', nickname]
            );
        }

        if (phone) {
            await conn.execute(
                `INSERT INTO \`${WP_PREFIX}usermeta\` (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
                [userId, 'billing_phone', phone]
            );
        }

        await conn.execute(
            `INSERT INTO \`${WP_PREFIX}usermeta\` (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
            [userId, `${WP_PREFIX}capabilities`, 'a:1:{s:8:"customer";b:1;}']
        );

        await conn.execute(
            `INSERT INTO \`${WP_PREFIX}usermeta\` (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
            [userId, `${WP_PREFIX}user_level`, '0']
        );



        await conn.execute(
            `INSERT INTO \`${WP_PREFIX}usermeta\` (user_id, meta_key, meta_value) VALUES (?, ?, ?)`,
            [userId, `${WP_PREFIX}user_level`, '0']
        );

        // Auto-login: issue JWT cookie
        const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '1h' });
        res.setHeader('Set-Cookie', serialize('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60,
            path: '/',
        }));

        return res.status(201).json({ success: true, message: 'Account created with role Customer' });

    } catch (err) {
        console.error('❌ DB/login Error:', err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    } finally {
        if (conn) await conn.end();
    }
}