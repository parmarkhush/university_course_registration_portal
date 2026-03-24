const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const allowedStudents = require('./allowed-students.json');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const ATTENDANCE_SUBJECTS = [
    'Software Engineering',
    'DAA',
    'Stats',
    'TOC',
    'COA',
    'DAA Lab',
    'Software Lab',
    'Design Lab'
];
const STUDENT_EMAIL_DOMAIN = 'sot.pdpu.ac.in';
const allowedStudentMap = new Map(
    allowedStudents.map(student => [student.rollNo.toUpperCase(), student])
);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_portal',
    waitForConnections: true,
    connectionLimit: 10
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

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

function normalizeRollNo(value) {
    return String(value || '').trim().toUpperCase();
}

function resolveAllowedRollNo(value) {
    const normalized = normalizeRollNo(value).replace(/\s+/g, '');
    if (!normalized) {
        return null;
    }

    if (allowedStudentMap.has(normalized)) {
        return normalized;
    }

    const matches = allowedStudents
        .map(student => student.rollNo.toUpperCase())
        .filter(rollNo => rollNo.endsWith(normalized));

    return matches.length === 1 ? matches[0] : null;
}

function getAllowedStudentFromEmail(email) {
    const match = String(email || '').trim().match(/^([a-z0-9]+)@sot\.pdpu\.ac\.in$/i);
    if (!match) {
        return null;
    }

    const rollNo = normalizeRollNo(match[1]);
    const student = allowedStudentMap.get(rollNo);
    if (!student) {
        return null;
    }

    return {
        ...student,
        rollNo
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

function mapAttendanceSummaryRows(rows) {
    const valuesBySubject = new Map(
        rows.map(row => [
            row.subject_name,
            {
                subject: row.subject_name,
                attendedClasses: Number(row.attended_classes || 0),
                totalClasses: Number(row.total_classes || 0)
            }
        ])
    );

    return ATTENDANCE_SUBJECTS.map(subject => {
        const record = valuesBySubject.get(subject) || {
            subject,
            attendedClasses: 0,
            totalClasses: 0
        };
        return {
            ...record,
            percentage: record.totalClasses > 0
                ? Number(((record.attendedClasses / record.totalClasses) * 100).toFixed(1))
                : 0
        };
    });
}

function mapMarksSummaryRows(rows) {
    const valuesBySubject = new Map(
        rows.map(row => [
            row.subject_name,
            {
                subject: row.subject_name,
                score: Number(row.score || 0),
                maxScore: Number(row.max_score || 0)
            }
        ])
    );

    return ATTENDANCE_SUBJECTS.map(subject => {
        const record = valuesBySubject.get(subject) || {
            subject,
            score: 0,
            maxScore: 100
        };
        return {
            ...record,
            percentage: record.maxScore > 0
                ? Number(((record.score / record.maxScore) * 100).toFixed(1))
                : 0
        };
    });
}

function mapAnnouncementRow(row) {
    return {
        id: row.id,
        title: row.title,
        message: row.message,
        targetRollNo: row.target_roll_no,
        createdAt: row.created_at,
        facultyName: row.faculty_name,
        pdfFileName: row.pdf_file_name,
        hasPdf: Boolean(row.pdf_base64)
    };
}

async function getStudentByRollNo(rollNo) {
    const resolvedRollNo = resolveAllowedRollNo(rollNo) || rollNo;
    const [rows] = await pool.query(
        `SELECT u.id, u.username, sp.roll_no
         FROM users u
         INNER JOIN student_profiles sp ON sp.user_id = u.id
         WHERE UPPER(sp.roll_no) = UPPER(?)
         LIMIT 1`,
        [resolvedRollNo]
    );

    return rows[0] || null;
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
    const { email, mobile, password } = req.body;

    if (!email || !mobile || !password) {
        return res.status(400).json({ message: 'Email, mobile, and password are required.' });
    }

    const allowedStudent = getAllowedStudentFromEmail(email);
    if (!allowedStudent) {
        return res.status(400).json({
            message: `Only approved student emails in the format rollno@${STUDENT_EMAIL_DOMAIN} can register.`
        });
    }

    const username = allowedStudent.rollNo.toLowerCase();

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

        const [users] = await pool.query(
            'SELECT id FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        if (users.length > 0) {
            await pool.query(
                `INSERT INTO student_profiles (user_id, name, roll_no, gender, cpi, preferred_courses)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    roll_no = VALUES(roll_no)`,
                [users[0].id, allowedStudent.name, allowedStudent.rollNo, 'Not Specified', 0, JSON.stringify([])]
            );
        }

        res.status(201).json({
            message: 'Account created successfully.',
            student: {
                username,
                name: allowedStudent.name,
                rollNo: allowedStudent.rollNo,
                email: email.trim().toLowerCase()
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to register user.', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const allowedStudent = getAllowedStudentFromEmail(email);
        if (allowedStudent) {
            const [studentRows] = await pool.query(
                'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1',
                [email, password]
            );

            if (studentRows.length > 0) {
                return res.json({
                    message: 'Student login successful.',
                    role: 'student',
                    user: mapUserRow(studentRows[0])
                });
            }
        }

        const [facultyRows] = await pool.query(
            'SELECT id, username, faculty_name, email, department FROM faculty_users WHERE email = ? AND password = ? LIMIT 1',
            [email, password]
        );

        if (facultyRows.length > 0) {
            return res.json({
                message: 'Faculty login successful.',
                role: 'faculty',
                faculty: {
                    id: facultyRows[0].id,
                    username: facultyRows[0].username,
                    name: facultyRows[0].faculty_name,
                    email: facultyRows[0].email,
                    department: facultyRows[0].department
                }
            });
        }

        res.status(401).json({ message: 'Invalid email or password.' });
    } catch (error) {
        res.status(500).json({ message: 'Unable to log in.', error: error.message });
    }
});

app.post('/api/faculty/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, username, faculty_name, email, department FROM faculty_users WHERE email = ? AND password = ? LIMIT 1',
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid faculty email or password.' });
        }

        res.json({
            message: 'Faculty login successful.',
            faculty: {
                id: rows[0].id,
                username: rows[0].username,
                name: rows[0].faculty_name,
                email: rows[0].email,
                department: rows[0].department
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to log in faculty.', error: error.message });
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

app.get('/api/students/:username/attendance', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id FROM users WHERE username = ? LIMIT 1',
            [req.params.username]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const [rows] = await pool.query(
            `SELECT subject_name, attended_classes, total_classes
             FROM attendance_records
             WHERE student_user_id = ?
             ORDER BY subject_name ASC`,
            [users[0].id]
        );

        res.json({ attendance: mapAttendanceSummaryRows(rows) });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load attendance.', error: error.message });
    }
});

app.get('/api/students/attendance/roll/:rollNo', async (req, res) => {
    try {
        const student = await getStudentByRollNo(req.params.rollNo);
        if (!student) {
            return res.status(404).json({ message: 'Student roll number not found.' });
        }

        const [rows] = await pool.query(
            `SELECT subject_name, attended_classes, total_classes
             FROM attendance_records
             WHERE student_user_id = ?
             ORDER BY subject_name ASC`,
            [student.id]
        );

        res.json({
            username: student.username,
            rollNo: student.roll_no,
            attendance: mapAttendanceSummaryRows(rows)
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load attendance by roll number.', error: error.message });
    }
});

app.get('/api/students/:username/marks', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id FROM users WHERE username = ? LIMIT 1',
            [req.params.username]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const [rows] = await pool.query(
            `SELECT subject_name, score, max_score
             FROM student_marks
             WHERE student_user_id = ?
             ORDER BY subject_name ASC`,
            [users[0].id]
        );

        res.json({ marks: mapMarksSummaryRows(rows) });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load marks.', error: error.message });
    }
});

app.get('/api/students/:username/announcements', async (req, res) => {
    try {
        const [profiles] = await pool.query(
            `SELECT sp.roll_no
             FROM users u
             LEFT JOIN student_profiles sp ON sp.user_id = u.id
             WHERE u.username = ?
             LIMIT 1`,
            [req.params.username]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const rollNo = profiles[0].roll_no || '';
        const normalizedRollNo = (resolveAllowedRollNo(rollNo) || normalizeRollNo(rollNo)).replace(/\s+/g, '');
        const [rows] = await pool.query(
            `SELECT fa.*, fu.faculty_name
             FROM faculty_announcements fa
             INNER JOIN faculty_users fu ON fu.id = fa.faculty_user_id
              WHERE fa.target_roll_no IS NULL
                 OR (
                    fa.target_roll_no IS NOT NULL
                    AND REPLACE(UPPER(fa.target_roll_no), ' ', '') = ?
                 )
              ORDER BY fa.created_at DESC`,
            [normalizedRollNo]
        );

        res.json({ announcements: rows.map(mapAnnouncementRow) });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load faculty announcements.', error: error.message });
    }
});

app.get('/api/faculty/students', async (req, res) => {
    const subjectName = ATTENDANCE_SUBJECTS.includes(req.query.subject)
        ? req.query.subject
        : ATTENDANCE_SUBJECTS[0];

    try {
        const [rows] = await pool.query(
            `SELECT u.id AS user_id, u.username,
                    COALESCE(sp.name, u.username) AS name,
                    COALESCE(sp.roll_no, 'Not provided') AS roll_no,
                    COALESCE(sp.cpi, 0) AS cpi,
                    COALESCE(ar.attended_classes, 0) AS attended_classes,
                    COALESCE(ar.total_classes, 0) AS total_classes,
                    COALESCE(sm.score, 0) AS mark_score,
                    COALESCE(sm.max_score, 100) AS max_score
             FROM users u
             LEFT JOIN student_profiles sp ON sp.user_id = u.id
             LEFT JOIN attendance_records ar
                ON ar.student_user_id = u.id
               AND ar.subject_name = ?
             LEFT JOIN student_marks sm
                ON sm.student_user_id = u.id
               AND sm.subject_name = ?
             ORDER BY name ASC`,
            [subjectName, subjectName]
        );

        res.json({
            subject: subjectName,
            students: rows.map(row => ({
                userId: row.user_id,
                username: row.username,
                name: row.name,
                rollNo: row.roll_no,
                cpi: Number(row.cpi),
                attendedClasses: Number(row.attended_classes),
                totalClasses: Number(row.total_classes),
                score: Number(row.mark_score),
                maxScore: Number(row.max_score),
                markPercentage: Number(row.max_score) > 0
                    ? Number(((Number(row.mark_score) / Number(row.max_score)) * 100).toFixed(1))
                    : 0,
                percentage: Number(row.total_classes) > 0
                    ? Number(((Number(row.attended_classes) / Number(row.total_classes)) * 100).toFixed(1))
                    : 0
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load students for faculty portal.', error: error.message });
    }
});

app.get('/api/faculty/announcements', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT fa.*, fu.faculty_name
             FROM faculty_announcements fa
             INNER JOIN faculty_users fu ON fu.id = fa.faculty_user_id
             ORDER BY fa.created_at DESC
             LIMIT 20`
        );

        res.json({ announcements: rows.map(mapAnnouncementRow) });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load announcements.', error: error.message });
    }
});

app.post('/api/faculty/attendance', async (req, res) => {
    const { facultyUsername, studentUsername, studentRollNo, subjectName, status } = req.body;

    if (!facultyUsername || !subjectName || !status || (!studentUsername && !studentRollNo)) {
        return res.status(400).json({ message: 'Faculty username, student reference, subject, and status are required.' });
    }

    if (!ATTENDANCE_SUBJECTS.includes(subjectName)) {
        return res.status(400).json({ message: 'Invalid subject selected.' });
    }

    if (!['present', 'absent'].includes(status)) {
        return res.status(400).json({ message: 'Attendance status must be present or absent.' });
    }

    try {
        const [facultyRows] = await pool.query(
            'SELECT id FROM faculty_users WHERE username = ? LIMIT 1',
            [facultyUsername]
        );
        let studentRows = [];
        if (studentRollNo) {
            const student = await getStudentByRollNo(studentRollNo);
            if (student) {
                studentRows = [{ id: student.id, username: student.username }];
            }
        } else {
            const [rows] = await pool.query(
                'SELECT id, username FROM users WHERE username = ? LIMIT 1',
                [studentUsername]
            );
            studentRows = rows;
        }

        if (facultyRows.length === 0) {
            return res.status(404).json({ message: 'Faculty user not found.' });
        }

        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found for the given roll number.' });
        }

        const facultyId = facultyRows[0].id;
        const studentUserId = studentRows[0].id;
        const resolvedStudentUsername = studentRows[0].username || studentUsername || studentRollNo;
        const attendedIncrement = status === 'present' ? 1 : 0;

        await pool.query(
            `INSERT INTO attendance_records
                (student_user_id, subject_name, attended_classes, total_classes, updated_by_faculty_id)
             VALUES (?, ?, ?, 1, ?)
             ON DUPLICATE KEY UPDATE
                attended_classes = attended_classes + VALUES(attended_classes),
                total_classes = total_classes + 1,
                updated_by_faculty_id = VALUES(updated_by_faculty_id)`,
            [studentUserId, subjectName, attendedIncrement, facultyId]
        );

        const [rows] = await pool.query(
            `SELECT subject_name, attended_classes, total_classes
             FROM attendance_records
             WHERE student_user_id = ? AND subject_name = ?
             LIMIT 1`,
            [studentUserId, subjectName]
        );

        const row = rows[0] || {
            subject_name: subjectName,
            attended_classes: 0,
            total_classes: 0
        };
        const record = {
            subject: row.subject_name,
            attendedClasses: Number(row.attended_classes),
            totalClasses: Number(row.total_classes),
            percentage: Number(row.total_classes) > 0
                ? Number(((Number(row.attended_classes) / Number(row.total_classes)) * 100).toFixed(1))
                : 0
        };
        res.json({
            message: `Attendance marked as ${status} for ${resolvedStudentUsername} in ${subjectName}.`,
            attendance: record
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to mark attendance.', error: error.message });
    }
});

app.post('/api/faculty/marks', async (req, res) => {
    const { facultyUsername, studentUsername, studentRollNo, subjectName, score, maxScore } = req.body;

    if (!facultyUsername || !subjectName || score === undefined || maxScore === undefined || (!studentUsername && !studentRollNo)) {
        return res.status(400).json({ message: 'Faculty username, student reference, subject, score, and max score are required.' });
    }

    if (!ATTENDANCE_SUBJECTS.includes(subjectName)) {
        return res.status(400).json({ message: 'Invalid subject selected.' });
    }

    const parsedScore = Number(score);
    const parsedMaxScore = Number(maxScore);

    if (!Number.isFinite(parsedScore) || !Number.isFinite(parsedMaxScore) || parsedScore < 0 || parsedMaxScore <= 0 || parsedScore > parsedMaxScore) {
        return res.status(400).json({ message: 'Enter valid marks where score is between 0 and max score.' });
    }

    try {
        const [facultyRows] = await pool.query(
            'SELECT id FROM faculty_users WHERE username = ? LIMIT 1',
            [facultyUsername]
        );
        let studentRows = [];
        if (studentRollNo) {
            const student = await getStudentByRollNo(studentRollNo);
            if (student) {
                studentRows = [{ id: student.id, username: student.username }];
            }
        } else {
            const [rows] = await pool.query(
                'SELECT id, username FROM users WHERE username = ? LIMIT 1',
                [studentUsername]
            );
            studentRows = rows;
        }

        if (facultyRows.length === 0) {
            return res.status(404).json({ message: 'Faculty user not found.' });
        }

        if (studentRows.length === 0) {
            return res.status(404).json({ message: 'Student record not found for the given roll number.' });
        }

        await pool.query(
            `INSERT INTO student_marks (student_user_id, subject_name, score, max_score, updated_by_faculty_id)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                max_score = VALUES(max_score),
                updated_by_faculty_id = VALUES(updated_by_faculty_id)`,
            [studentRows[0].id, subjectName, parsedScore, parsedMaxScore, facultyRows[0].id]
        );

        const resolvedStudentUsername = studentRows[0].username || studentUsername || studentRollNo;

        res.json({
            message: `Marks updated for ${resolvedStudentUsername} in ${subjectName}.`,
            mark: {
                subject: subjectName,
                score: parsedScore,
                maxScore: parsedMaxScore,
                percentage: Number(((parsedScore / parsedMaxScore) * 100).toFixed(1))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to save marks.', error: error.message });
    }
});

app.post('/api/faculty/announcements', async (req, res) => {
    const {
        facultyUsername,
        title,
        message,
        targetRollNo,
        pdfFileName,
        pdfMimeType,
        pdfBase64
    } = req.body;

    if (!facultyUsername || !title || !message) {
        return res.status(400).json({ message: 'Faculty username, title, and message are required.' });
    }

    if (pdfBase64 && pdfMimeType !== 'application/pdf') {
        return res.status(400).json({ message: 'Only PDF attachments are supported.' });
    }

    try {
        const [facultyRows] = await pool.query(
            'SELECT id FROM faculty_users WHERE username = ? LIMIT 1',
            [facultyUsername]
        );

        if (facultyRows.length === 0) {
            return res.status(404).json({ message: 'Faculty user not found.' });
        }

        await pool.query(
            `INSERT INTO faculty_announcements
                (faculty_user_id, title, message, target_roll_no, pdf_file_name, pdf_mime_type, pdf_base64)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                facultyRows[0].id,
                title,
                message,
                targetRollNo ? (resolveAllowedRollNo(targetRollNo) || targetRollNo.trim()) : null,
                pdfBase64 ? (pdfFileName || 'task.pdf') : null,
                pdfBase64 ? pdfMimeType : null,
                pdfBase64 || null
            ]
        );

        res.status(201).json({ message: 'Announcement published successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Unable to publish announcement.', error: error.message });
    }
});

app.get('/api/announcements/:id/file', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT pdf_file_name, pdf_mime_type, pdf_base64 FROM faculty_announcements WHERE id = ? LIMIT 1',
            [req.params.id]
        );

        if (rows.length === 0 || !rows[0].pdf_base64) {
            return res.status(404).send('PDF not found.');
        }

        const buffer = Buffer.from(rows[0].pdf_base64, 'base64');
        res.setHeader('Content-Type', rows[0].pdf_mime_type || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${rows[0].pdf_file_name || 'attachment.pdf'}"`);
        res.send(buffer);
    } catch (error) {
        res.status(500).send('Unable to download PDF.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'dashboard.html'));
});

app.get('/faculty.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'faculty.html'));
});

app.use((error, req, res, next) => {
    if (error?.type === 'entity.too.large') {
        return res.status(413).json({
            message: 'The attached PDF is too large. Please upload a smaller file.'
        });
    }

    return next(error);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
