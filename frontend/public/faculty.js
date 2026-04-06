const FACULTY_STORAGE_KEY = 'currentFaculty';
const THEME_STORAGE_KEY = 'portalTheme';
const DEFAULT_SUBJECTS = [
    'Software Engineering',
    'DAA',
    'TOC',
    'COA',
    'DAA Lab',
    'Software Lab',
    'Design Thinking Lab'
];

const facultyState = {
    currentFaculty: JSON.parse(localStorage.getItem(FACULTY_STORAGE_KEY) || 'null'),
    attendanceSubject: '',
    marksSubject: '',
    allowedSubjects: [],
    allowedWeekdays: [],
    attendanceDate: '',
    students: [],
    announcements: []
};

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Request failed.');
    }

    return data;
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-option').forEach(button => {
        const isActive = button.dataset.themeChoice === theme;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    applyTheme(savedTheme);
}

function setTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
}

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDateDaysAgo(daysAgo) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    return getLocalDateString(date);
}

function getDayName(dateString) {
    const [year, month, day] = String(dateString || '').split('-').map(Number);
    const date = new Date(year, (month || 1) - 1, day || 1);
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
}

function updateAttendanceDateHint() {
    const hint = document.getElementById('attendanceDateHint');
    if (!hint) {
        return;
    }

    const weekdays = facultyState.allowedWeekdays.length
        ? facultyState.allowedWeekdays.join(', ')
        : 'your timetable days';
    hint.textContent = `Allowed only on ${weekdays}. Future dates are blocked and only the last 7 days can be used.`;
}

function configureAttendanceDateInput() {
    const input = document.getElementById('attendanceDate');
    if (!input) {
        return;
    }

    input.min = getDateDaysAgo(6);
    input.max = getLocalDateString();

    if (!facultyState.attendanceDate || facultyState.attendanceDate < input.min || facultyState.attendanceDate > input.max) {
        facultyState.attendanceDate = input.max;
    }

    input.value = facultyState.attendanceDate;
    updateAttendanceDateHint();
}

function validateSelectedAttendanceDate(showError = true) {
    const input = document.getElementById('attendanceDate');
    if (!input) {
        return true;
    }

    const value = input.value || facultyState.attendanceDate;
    const min = input.min;
    const max = input.max;
    const dayName = getDayName(value);

    if (!value || value < min || value > max) {
        if (showError) {
            showMessage('facultyAttendanceMessage', `Select a date between ${min} and ${max}.`, 'error');
        }
        return false;
    }

    if (facultyState.allowedWeekdays.length && !facultyState.allowedWeekdays.includes(dayName)) {
        if (showError) {
            showMessage('facultyAttendanceMessage', `${facultyState.attendanceSubject} attendance can only be marked on ${facultyState.allowedWeekdays.join(', ')}.`, 'error');
        }
        return false;
    }

    if (dayName === 'Saturday' || dayName === 'Sunday') {
        if (showError) {
            showMessage('facultyAttendanceMessage', 'Saturday and Sunday are holidays. Attendance cannot be marked on weekends.', 'error');
        }
        return false;
    }

    return true;
}

function showMessage(elementId, text, type) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }
    element.textContent = text;
    element.classList.remove('success', 'error');
    if (type) {
        element.classList.add(type);
    }
}

function showFacultySection(section) {
    document.querySelectorAll('.content-section').forEach(sectionNode => sectionNode.classList.add('hidden'));
    document.querySelectorAll('.menu-item[data-section]').forEach(item => item.classList.remove('active'));

    const sectionMap = {
        attendance: 'facultyAttendanceSection',
        marks: 'facultyMarksSection',
        announcements: 'facultyAnnouncementsSection'
    };

    document.getElementById(sectionMap[section] || 'facultyAttendanceSection').classList.remove('hidden');
    document.querySelector(`.menu-item[data-section="${section}"]`).classList.add('active');

    if (section === 'attendance') {
        loadAttendanceStudents();
    } else if (section === 'marks') {
        loadMarksStudents();
    } else {
        loadAnnouncements();
    }
}

function populateSubjectOptions() {
    const attendanceSelect = document.getElementById('attendanceSubject');
    const marksSelect = document.getElementById('marksSubject');
    const subjects = facultyState.allowedSubjects.length ? facultyState.allowedSubjects : DEFAULT_SUBJECTS;
    const options = subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('');
    attendanceSelect.innerHTML = options;
    marksSelect.innerHTML = options;
    facultyState.attendanceSubject = subjects.includes(facultyState.attendanceSubject)
        ? facultyState.attendanceSubject
        : subjects[0];
    facultyState.marksSubject = subjects.includes(facultyState.marksSubject)
        ? facultyState.marksSubject
        : subjects[0];
    attendanceSelect.value = facultyState.attendanceSubject;
    marksSelect.value = facultyState.marksSubject;
}

function renderFacultyAccountStrip() {
    const container = document.getElementById('facultyAccountStrip');
    if (!container || !facultyState.currentFaculty) {
        return;
    }

    const subjectList = (facultyState.currentFaculty.allowedSubjects || facultyState.allowedSubjects || DEFAULT_SUBJECTS)
        .map(subject => `<span>${escapeHtml(subject)}</span>`)
        .join('');
    const timetableList = (facultyState.currentFaculty.timetable || [])
        .map(item => `<span>${escapeHtml(item.subject)}: ${escapeHtml((item.weekdays || []).join(', '))}</span>`)
        .join('');

    container.innerHTML = `
        <div class="faculty-account-card">
            <strong>${escapeHtml(facultyState.currentFaculty.name || 'Faculty')}</strong>
            <p>${escapeHtml(facultyState.currentFaculty.email || '')}</p>
        </div>
        <div class="faculty-account-card">
            <strong>Faculty Code</strong>
            <p>${escapeHtml(facultyState.currentFaculty.facultyCode || 'Assigned')}</p>
        </div>
        <div class="faculty-account-card faculty-account-subjects">
            <strong>Assigned Subjects</strong>
            <div class="faculty-subject-tags">${subjectList || '<span>Not assigned</span>'}</div>
        </div>
        <div class="faculty-account-card faculty-account-subjects">
            <strong>Allowed Weekdays</strong>
            <div class="faculty-subject-tags">${timetableList || '<span>Configured after login</span>'}</div>
        </div>
    `;
}

function renderAttendanceSummary(students) {
    const container = document.getElementById('facultyAttendanceSummary');
    const average = students.length
        ? (students.reduce((sum, student) => sum + student.percentage, 0) / students.length).toFixed(1)
        : '0.0';

    container.innerHTML = `
        <div class="overview-card">
            <h3>Total Students</h3>
            <p><strong>${students.length}</strong><br>registered for review</p>
        </div>
        <div class="overview-card">
            <h3>Average Attendance</h3>
            <p><strong>${average}%</strong><br>for ${facultyState.attendanceSubject}</p>
        </div>
        <div class="overview-card">
            <h3>Selected Subject</h3>
            <p><strong>${facultyState.attendanceSubject}</strong><br>attendance tracking active</p>
        </div>
        <div class="overview-card">
            <h3>Selected Date</h3>
            <p><strong>${facultyState.attendanceDate}</strong><br>${facultyState.allowedWeekdays.join(', ') || 'timetable-restricted days'}</p>
        </div>
    `;
}

function renderAttendanceStudents(students) {
    const container = document.getElementById('facultyAttendanceList');
    renderAttendanceSummary(students);

    if (!students.length) {
        container.innerHTML = '<p class="empty-message">No students available to mark attendance.</p>';
        return;
    }

    container.innerHTML = students.map(student => `
        <div class="course-card faculty-card">
            <h3>${student.name}</h3>
            <p><strong>Roll No:</strong> ${student.rollNo}</p>
            <p><strong>Username:</strong> ${student.username}</p>
            <p><strong>Attendance:</strong> ${student.attendedClasses}/${student.totalClasses} classes</p>
            <p class="seats-info ${student.percentage >= 75 ? '' : (student.percentage >= 40 ? 'low' : 'full')}">${student.percentage}%</p>
            <div class="faculty-card-actions">
                <button type="button" onclick="markAttendance('${student.rollNo}', 'present')">Present</button>
                <button type="button" class="enrolled" onclick="markAttendance('${student.rollNo}', 'absent')">Absent</button>
            </div>
        </div>
    `).join('');
}

function renderMarksSummary(students) {
    const container = document.getElementById('facultyMarksSummary');
    const graded = students.filter(student => student.maxScore > 0);
    const average = graded.length
        ? (graded.reduce((sum, student) => sum + student.markPercentage, 0) / graded.length).toFixed(1)
        : '0.0';

    container.innerHTML = `
        <div class="overview-card">
            <h3>Total Students</h3>
            <p><strong>${students.length}</strong><br>available for grading</p>
        </div>
        <div class="overview-card">
            <h3>Average Marks</h3>
            <p><strong>${average}%</strong><br>for ${facultyState.marksSubject}</p>
        </div>
        <div class="overview-card">
            <h3>Selected Subject</h3>
            <p><strong>${facultyState.marksSubject}</strong><br>marks upload active</p>
        </div>
    `;
}

function renderMarksStudents(students) {
    const container = document.getElementById('facultyMarksList');
    renderMarksSummary(students);

    if (!students.length) {
        container.innerHTML = '<p class="empty-message">No students available to upload marks.</p>';
        return;
    }

    container.innerHTML = students.map(student => `
        <div class="course-card faculty-card">
            <h3>${student.name}</h3>
            <p><strong>Roll No:</strong> ${student.rollNo}</p>
            <p><strong>Username:</strong> ${student.username}</p>
            <p><strong>Current Marks:</strong> ${student.score}/${student.maxScore}</p>
            <p><strong>IA:</strong> ${student.iaMarks || 0}/25</p>
            <p><strong>Mid Sem:</strong> ${student.midSemMarks || 0}/25</p>
            <p><strong>End Sem:</strong> ${student.endSemMarks || 0}/50</p>
            <p class="seats-info ${student.markPercentage >= 75 ? '' : (student.markPercentage >= 40 ? 'low' : 'full')}">${student.markPercentage}%</p>
            <form class="faculty-marks-form" onsubmit="saveMarks(event, '${student.rollNo}')">
                <label>
                    IA Marks
                    <input type="number" name="iaMarks" min="0" max="25" step="0.01" value="${student.iaMarks || 0}">
                </label>
                <label>
                    Mid Sem Marks
                    <input type="number" name="midSemMarks" min="0" max="25" step="0.01" value="${student.midSemMarks || 0}">
                </label>
                <label>
                    End Sem Marks
                    <input type="number" name="endSemMarks" min="0" max="50" step="0.01" value="${student.endSemMarks || 0}">
                </label>
                <p class="marks-breakdown-note">Total is calculated automatically out of 100.</p>
                <label>
                    Total
                    <input type="number" name="totalMarks" min="0" max="100" step="0.01" value="${student.score}" readonly>
                </label>
                <button type="submit">Save Marks</button>
            </form>
        </div>
    `).join('');
}

function renderAnnouncementSummary(announcements) {
    const container = document.getElementById('facultyAnnouncementSummary');
    const targeted = announcements.filter(item => item.targetRollNo).length;

    container.innerHTML = `
        <div class="overview-card">
            <h3>Total Published</h3>
            <p><strong>${announcements.length}</strong><br>recent announcement(s)</p>
        </div>
        <div class="overview-card">
            <h3>Targeted Notices</h3>
            <p><strong>${targeted}</strong><br>shared with one roll number</p>
        </div>
        <div class="overview-card">
            <h3>Broadcast Notices</h3>
            <p><strong>${announcements.length - targeted}</strong><br>visible to all students</p>
        </div>
    `;
}

function renderAnnouncements(announcements) {
    const container = document.getElementById('facultyAnnouncementList');
    renderAnnouncementSummary(announcements);

    if (!announcements.length) {
        container.innerHTML = '<p class="empty-message">No announcements published yet.</p>';
        return;
    }

    container.innerHTML = announcements.map(item => `
        <div class="notification-card">
            <h3>${escapeHtml(item.title)}</h3>
            <p><strong>Audience:</strong> ${item.targetRollNo ? `Roll No ${escapeHtml(item.targetRollNo)}` : 'All students'}</p>
            <p>${escapeHtml(item.message)}</p>
            ${item.hasPdf ? `<p><a href="/api/announcements/${item.id}/file" target="_blank" rel="noopener noreferrer">Open PDF: ${escapeHtml(item.pdfFileName || 'attachment.pdf')}</a></p>` : ''}
            <time>${new Date(item.createdAt).toLocaleString('en-IN')}</time>
        </div>
    `).join('');
}

function attachMarksTotalListeners() {
    document.querySelectorAll('.faculty-marks-form').forEach(form => {
        const updateTotal = () => {
            const iaMarks = Number(form.elements.iaMarks.value || 0);
            const midSemMarks = Number(form.elements.midSemMarks.value || 0);
            const endSemMarks = Number(form.elements.endSemMarks.value || 0);
            form.elements.totalMarks.value = (iaMarks + midSemMarks + endSemMarks).toFixed(2).replace(/\.00$/, '');
        };

        ['iaMarks', 'midSemMarks', 'endSemMarks'].forEach(name => {
            form.elements[name].addEventListener('input', updateTotal);
        });

        updateTotal();
    });
}

async function loadAttendanceStudents() {
    const data = await apiRequest(
        `/api/faculty/students?subject=${encodeURIComponent(facultyState.attendanceSubject)}&facultyUsername=${encodeURIComponent(facultyState.currentFaculty.username)}`
    );
    facultyState.allowedSubjects = data.allowedSubjects || facultyState.allowedSubjects;
    facultyState.allowedWeekdays = data.allowedWeekdays || [];
    configureAttendanceDateInput();
    facultyState.students = data.students || [];
    renderAttendanceStudents(facultyState.students);
}

async function loadMarksStudents() {
    const data = await apiRequest(
        `/api/faculty/students?subject=${encodeURIComponent(facultyState.marksSubject)}&facultyUsername=${encodeURIComponent(facultyState.currentFaculty.username)}`
    );
    facultyState.allowedSubjects = data.allowedSubjects || facultyState.allowedSubjects;
    facultyState.students = data.students || [];
    renderMarksStudents(facultyState.students);
    attachMarksTotalListeners();
}

async function loadAnnouncements() {
    const data = await apiRequest('/api/faculty/announcements');
    facultyState.announcements = data.announcements || [];
    renderAnnouncements(facultyState.announcements);
}

function readSelectedPdf(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
        return Promise.resolve(null);
    }

    if (file.type !== 'application/pdf') {
        return Promise.reject(new Error('Please upload a PDF file only.'));
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            const base64 = result.includes(',') ? result.split(',')[1] : '';
            resolve({
                pdfBase64: base64,
                pdfFileName: file.name,
                pdfMimeType: file.type
            });
        };
        reader.onerror = () => reject(new Error('Unable to read the selected PDF file.'));
        reader.readAsDataURL(file);
    });
}

async function markAttendance(studentRollNo, status) {
    if (!validateSelectedAttendanceDate(true)) {
        return;
    }

    try {
        const response = await apiRequest('/api/faculty/attendance', {
            method: 'POST',
            body: JSON.stringify({
                facultyUsername: facultyState.currentFaculty.username,
                studentRollNo,
                subjectName: facultyState.attendanceSubject,
                attendanceDate: facultyState.attendanceDate,
                status
            })
        });
        showMessage('facultyAttendanceMessage', response.message, 'success');
        await loadAttendanceStudents();
    } catch (error) {
        showMessage('facultyAttendanceMessage', error.message, 'error');
    }
}

async function saveMarks(event, studentRollNo) {
    event.preventDefault();
    const form = event.currentTarget;
    const iaMarks = Number(form.elements.iaMarks.value);
    const midSemMarks = Number(form.elements.midSemMarks.value);
    const endSemMarks = Number(form.elements.endSemMarks.value);

    try {
        const response = await apiRequest('/api/faculty/marks', {
            method: 'POST',
            body: JSON.stringify({
                facultyUsername: facultyState.currentFaculty.username,
                studentRollNo,
                subjectName: facultyState.marksSubject,
                iaMarks,
                midSemMarks,
                endSemMarks
            })
        });
        showMessage('facultyMarksMessage', response.message, 'success');
        await loadMarksStudents();
    } catch (error) {
        showMessage('facultyMarksMessage', error.message, 'error');
    }
}

async function publishAnnouncement(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const title = form.elements.title.value.trim();
    const message = form.elements.message.value.trim();
    const targetRollNo = form.elements.targetRollNo.value.trim();

    try {
        const filePayload = await readSelectedPdf(form.elements.pdf);
        const response = await apiRequest('/api/faculty/announcements', {
            method: 'POST',
            body: JSON.stringify({
                facultyUsername: facultyState.currentFaculty.username,
                title,
                message,
                targetRollNo,
                ...(filePayload || {})
            })
        });

        showMessage('facultyAnnouncementMessage', response.message, 'success');
        form.reset();
        await loadAnnouncements();
    } catch (error) {
        showMessage('facultyAnnouncementMessage', error.message, 'error');
    }
}

if (!facultyState.currentFaculty) {
    window.location.href = 'index.html';
} else {
    facultyState.attendanceDate = getLocalDateString();
    facultyState.allowedSubjects = Array.isArray(facultyState.currentFaculty.allowedSubjects) && facultyState.currentFaculty.allowedSubjects.length
        ? facultyState.currentFaculty.allowedSubjects
        : DEFAULT_SUBJECTS;
    facultyState.attendanceSubject = facultyState.allowedSubjects[0];
    facultyState.marksSubject = facultyState.allowedSubjects[0];

    document.getElementById('attendanceSubject').addEventListener('change', async event => {
        facultyState.attendanceSubject = event.target.value;
        await loadAttendanceStudents();
    });

    configureAttendanceDateInput();
    document.getElementById('attendanceDate').addEventListener('change', event => {
        facultyState.attendanceDate = event.target.value || getLocalDateString();
        validateSelectedAttendanceDate(true);
        renderAttendanceSummary(facultyState.students);
    });

    document.getElementById('facultyAttendanceRollNo').addEventListener('input', event => {
        const value = event.target.value.trim().toUpperCase();
        const cards = document.querySelectorAll('#facultyAttendanceList .faculty-card');
        cards.forEach(card => {
            const text = card.textContent.toUpperCase();
            card.style.display = !value || text.includes(value) ? '' : 'none';
        });
    });

    document.getElementById('marksSubject').addEventListener('change', async event => {
        facultyState.marksSubject = event.target.value;
        await loadMarksStudents();
    });

    document.getElementById('facultyMarksRollNo').addEventListener('input', event => {
        const value = event.target.value.trim().toUpperCase();
        const cards = document.querySelectorAll('#facultyMarksList .faculty-card');
        cards.forEach(card => {
            const text = card.textContent.toUpperCase();
            card.style.display = !value || text.includes(value) ? '' : 'none';
        });
    });

    document.getElementById('facultyLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem(FACULTY_STORAGE_KEY);
        window.location.href = 'index.html';
    });

    document.getElementById('facultyAnnouncementForm').addEventListener('submit', publishAnnouncement);

    document.getElementById('facultyWelcome').textContent = `Welcome, ${facultyState.currentFaculty.name}!`;

    initializeTheme();
    document.querySelectorAll('.theme-option').forEach(button => {
        button.addEventListener('click', () => setTheme(button.dataset.themeChoice));
    });
    populateSubjectOptions();
    renderFacultyAccountStrip();
    showFacultySection('attendance');
}

window.showFacultySection = showFacultySection;
window.markAttendance = markAttendance;
window.saveMarks = saveMarks;
