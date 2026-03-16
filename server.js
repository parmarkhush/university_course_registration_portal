const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_portal',
    waitForConnections: true,
    connectionLimit: 10
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'src')));

function parseJsonArray(value, fallback = []) {
    if (!value) {
        return fallback;
    }

    if (Array.isArray(value)) {
        return value;
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
}

function mapUserRow(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        username: row.username,
        email: row.email,
        mobile: row.mobile,
        program: row.program,
        academicLevel: row.academic_level,
        advisorName: row.advisor_name,
        advisorDepartment: row.advisor_department,
        advisorEmail: row.advisor_email,
        outstandingFees: Number(row.outstanding_fees || 0),
        maxCredits: row.max_credits,
        baseCredits: row.base_credits,
        hasHold: Boolean(row.has_hold),
        completedCourseIds: parseJsonArray(row.completed_course_ids)
    };
}

function mapProfileRow(row) {
    if (!row) {
        return null;
    }

    const preferredCourses = parseJsonArray(row.preferred_courses);

    return {
        id: row.id,
        userId: row.user_id,
        username: row.username,
        name: row.name,
        rollNo: row.roll_no,
        rollNumber: row.roll_no,
        gender: row.gender,
        cpi: Number(row.cpi),
        preferredCourses,
        preferredCourse: preferredCourses[0] || '-',
        updatedAt: row.updated_at
    };
}

app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ ok: true, message: 'Database connected.' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Database connection failed.', error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { username, email, mobile, password } = req.body;

    if (!username || !email || !mobile || !password) {
        return res.status(400).json({ message: 'All registration fields are required.' });
    }

    try {
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }

        await pool.query(
            `INSERT INTO users
            (username, email, mobile, password, completed_course_ids)
            VALUES (?, ?, ?, ?, ?)`,
            [username, email, mobile, password, JSON.stringify([])]
        );

        res.status(201).json({ message: 'Account created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Unable to register user.', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        res.json({
            message: 'Login successful.',
            user: mapUserRow(rows[0])
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to log in.', error: error.message });
    }
});

app.get('/api/users/:username', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? LIMIT 1',
            [req.params.username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ user: mapUserRow(rows[0]) });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load user.', error: error.message });
    }
});

app.get('/api/students/:username', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT sp.*, u.username
             FROM student_profiles sp
             INNER JOIN users u ON u.id = sp.user_id
             WHERE u.username = ?
             LIMIT 1`,
            [req.params.username]
        );

        res.json({ profile: mapProfileRow(rows[0] || null) });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load student profile.', error: error.message });
    }
});

app.put('/api/students/:username', async (req, res) => {
    const { name, rollNo, gender, cpi, preferredCourses } = req.body;

    if (!name || !rollNo || !gender || cpi === undefined || cpi === null) {
        return res.status(400).json({ message: 'All student fields except planned courses are required.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT id FROM users WHERE username = ? LIMIT 1',
            [req.params.username]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userId = users[0].id;
        const coursesJson = JSON.stringify(Array.isArray(preferredCourses) ? preferredCourses : []);

        await pool.query(
            `INSERT INTO student_profiles (user_id, name, roll_no, gender, cpi, preferred_courses)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                roll_no = VALUES(roll_no),
                gender = VALUES(gender),
                cpi = VALUES(cpi),
                preferred_courses = VALUES(preferred_courses)`,
            [userId, name, rollNo, gender, Number(cpi), coursesJson]
        );

        const [rows] = await pool.query(
            `SELECT sp.*, u.username
             FROM student_profiles sp
             INNER JOIN users u ON u.id = sp.user_id
             WHERE u.username = ?
             LIMIT 1`,
            [req.params.username]
        );

        res.json({
            message: 'Student profile saved successfully.',
            profile: mapProfileRow(rows[0])
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to save student profile.', error: error.message });
    }
});

app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT sp.*, u.username
             FROM student_profiles sp
             INNER JOIN users u ON u.id = sp.user_id
             ORDER BY sp.cpi DESC, sp.roll_no ASC`
        );

        let rank = 0;
        let previousCpi = null;

        const rankedStudents = rows.map((row, index) => {
            const profile = mapProfileRow(row);
            if (profile.cpi !== previousCpi) {
                rank = index + 1;
                previousCpi = profile.cpi;
            }

            return {
                ...profile,
                rank
            };
        });

        res.json({ students: rankedStudents });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load student rankings.', error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'src', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'src', 'dashboard.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
