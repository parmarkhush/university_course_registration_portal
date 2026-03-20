// Check if user is logged in
const currentUser = localStorage.getItem('currentUser');
const THEME_STORAGE_KEY = 'portalTheme';
let currentUserRecordCache = null;
let currentStudentProfileCache = null;

if (!currentUser) {
    // If no user, redirect to login
    window.location.href = 'index.html';
} else {
    // Display username
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser}!`;
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

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function initializeDashboardData() {
    try {
        const [{ user }, { profile }] = await Promise.all([
            apiRequest(`/api/users/${encodeURIComponent(currentUser)}`),
            apiRequest(`/api/students/${encodeURIComponent(currentUser)}`)
        ]);

        currentUserRecordCache = user;
        currentStudentProfileCache = profile;
        if (profile && profile.name) {
            document.getElementById('welcomeUser').textContent = `Welcome, ${profile.name}!`;
        }
    } catch (error) {
        currentUserRecordCache = typeof dataService !== 'undefined' && typeof dataService.getUserByUsername === 'function'
            ? dataService.getUserByUsername(currentUser)
            : null;
        currentStudentProfileCache = null;
    }
}

// Initialize courses from mock data (backend-ready structure)
function initializeCourses() {
    if (!localStorage.getItem('allCourses')) {
        // Load from mock data if available, otherwise use default
        const courses = typeof dataService !== 'undefined' 
            ? dataService.getAllCourses() 
            : [
                { id: 1, name: 'Data Structures', description: 'Learn fundamental data structures and algorithms', instructor: 'Dr. Smith', totalSeats: 30, enrolledCount: 0 },
                { id: 2, name: 'Web Development', description: 'Build modern web applications with HTML, CSS, and JavaScript', instructor: 'Prof. Johnson', totalSeats: 40, enrolledCount: 0 },
                { id: 3, name: 'Database Systems', description: 'Understanding relational databases and SQL', instructor: 'Dr. Williams', totalSeats: 25, enrolledCount: 0 },
                { id: 4, name: 'Machine Learning', description: 'Introduction to ML algorithms and applications', instructor: 'Prof. Brown', totalSeats: 20, enrolledCount: 0 },
                { id: 5, name: 'Computer Networks', description: 'Network protocols and architecture', instructor: 'Dr. Davis', totalSeats: 35, enrolledCount: 0 },
                { id: 6, name: 'Mobile App Development', description: 'Create Android and iOS applications', instructor: 'Prof. Miller', totalSeats: 30, enrolledCount: 0 }
            ];
        localStorage.setItem('allCourses', JSON.stringify(courses));
        return;
    }

    // Backfill new course fields for existing localStorage data
    if (typeof dataService !== 'undefined' && typeof dataService.getAllCourses === 'function') {
        const storedCourses = JSON.parse(localStorage.getItem('allCourses')) || [];
        const sourceCourses = dataService.getAllCourses();
        const normalizedCourses = storedCourses.map(stored => {
            const source = sourceCourses.find(course => course.id === stored.id) || {};
            return {
                ...source,
                ...stored,
                prerequisites: Array.isArray(stored.prerequisites) ? stored.prerequisites : (source.prerequisites || []),
                timeSlot: stored.timeSlot || source.timeSlot || 'TBD',
                credits: Number.isFinite(stored.credits) ? stored.credits : (source.credits || 0)
            };
        });
        const existingIds = new Set(normalizedCourses.map(course => course.id));
        const missingCourses = sourceCourses.filter(course => !existingIds.has(course.id));
        localStorage.setItem('allCourses', JSON.stringify([...normalizedCourses, ...missingCourses]));
    }
}

// Initialize enrollment data (backend-ready structure)
function initializeEnrollments() {
    if (!localStorage.getItem('enrollments')) {
        localStorage.setItem('enrollments', JSON.stringify({}));
    }
}

function initializeNotifications() {
    if (!localStorage.getItem('portalNotifications')) {
        localStorage.setItem('portalNotifications', JSON.stringify({}));
    }
}

// Initialize data
initializeCourses();
initializeEnrollments();
initializeNotifications();

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

const DEFAULT_ADVISOR = {
    name: 'Dr. Anjali Rao',
    department: 'Computer Science',
    email: 'advisor@university.edu'
};

const PORTAL_STATE = {
    courseSearch: '',
    department: 'all',
    credits: 'all',
    sortBy: 'name'
};

const ACADEMIC_CALENDAR = {
    title: 'Pandit Deendayal Energy University Academic Calendar',
    location: 'Gandhinagar, Gujarat, India',
    sourceLabel: 'Official PDEU Academic Calendar 2024-25 for FoET/FoLS',
    sourceUrl: 'https://api.pdeu.ac.in/pdeu-docs/academics/AcademicCalendarFOETFOLS.pdf',
    highlights: [
        { label: 'Monsoon / Odd Semester Starts', value: '21 July 2025' },
        { label: 'Diwali Break', value: '20 to 24 October 2025' },
        { label: 'Winter Break', value: '22 to 26 December 2025' },
        { label: 'Mid Semester Exam', value: '15 to 20 September 2025' },
        { label: 'End Semester Practical', value: '17 to 22 November 2025' },
        { label: 'End Semester Theory', value: '24 November to 6 December 2025' },
        { label: 'Spring / Even Semester Starts', value: '5 January 2026' },
        { label: 'Even Semester End Exam', value: '11 to 23 May 2026' },
        { label: 'Summer Vacation', value: '1 June to 10 July 2026' }
    ],
    monthRange: {
        start: { year: 2025, month: 6 },
        end: { year: 2026, month: 6 }
    },
    eventTypes: {
        classes: 'Classes',
        exam: 'Exam',
        practical: 'Practical',
        result: 'Result',
        leave: 'Leave'
    },
    events: [
        {
            title: 'Odd Semester Classes Begin',
            start: '2025-07-21',
            end: '2025-07-21',
            type: 'classes'
        },
        {
            title: 'Independence Day Celebration',
            start: '2025-08-15',
            end: '2025-08-15',
            type: 'leave'
        },
        {
            title: 'Odd Mid Semester Examination',
            start: '2025-09-15',
            end: '2025-09-20',
            type: 'exam'
        },
        {
            title: 'Diwali Break',
            start: '2025-10-20',
            end: '2025-10-24',
            type: 'leave'
        },
        {
            title: 'Odd End Semester Practical Examination',
            start: '2025-11-17',
            end: '2025-11-22',
            type: 'practical'
        },
        {
            title: 'Odd End Semester Theory Examination',
            start: '2025-11-24',
            end: '2025-12-06',
            type: 'exam'
        },
        {
            title: 'Odd Semester Result Declaration',
            start: '2025-12-08',
            end: '2025-12-08',
            type: 'result'
        },
        {
            title: 'Winter Break',
            start: '2025-12-22',
            end: '2025-12-26',
            type: 'leave'
        },
        {
            title: 'Even Semester Classes Begin',
            start: '2026-01-05',
            end: '2026-01-05',
            type: 'classes'
        },
        {
            title: 'Republic Day Celebration',
            start: '2026-01-26',
            end: '2026-01-26',
            type: 'leave'
        },
        {
            title: 'Even Mid Semester Examination',
            start: '2026-03-09',
            end: '2026-03-14',
            type: 'exam'
        },
        {
            title: 'Even End Semester Practical Examination',
            start: '2026-05-04',
            end: '2026-05-09',
            type: 'practical'
        },
        {
            title: 'Even End Semester Theory Examination',
            start: '2026-05-11',
            end: '2026-05-23',
            type: 'exam'
        },
        {
            title: 'Even Semester Result Declaration',
            start: '2026-05-26',
            end: '2026-05-26',
            type: 'result'
        },
        {
            title: 'Summer Vacation',
            start: '2026-06-01',
            end: '2026-07-10',
            type: 'leave'
        }
    ]
};

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

// Switch sections
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    
    const activeMenu = document.querySelector(`.menu-item[data-section="${section}"]`);
    if (activeMenu) {
        activeMenu.classList.add('active');
    }

    if (section === 'courses') {
        document.getElementById('coursesSection').classList.remove('hidden');
        loadMyCourses();
    } else if (section === 'newcourses') {
        document.getElementById('newcoursesSection').classList.remove('hidden');
        populateDepartmentFilter();
        loadNewCourses();
    } else if (section === 'notifications') {
        document.getElementById('notificationsSection').classList.remove('hidden');
        loadNotifications();
    } else if (section === 'calendar') {
        document.getElementById('calendarSection').classList.remove('hidden');
        loadAcademicCalendar();
    } else if (section === 'attendance') {
        document.getElementById('attendanceSection').classList.remove('hidden');
        loadAttendance();
    } else if (section === 'marks') {
        document.getElementById('marksSection').classList.remove('hidden');
        loadMarks();
    } else if (section === 'ranking') {
        document.getElementById('rankingSection').classList.remove('hidden');
        loadStudentRanking();
    }
}

function getCurrentUserRecord() {
    if (currentUserRecordCache) {
        return currentUserRecordCache;
    }
    if (typeof dataService !== 'undefined' && typeof dataService.getUserByUsername === 'function') {
        return dataService.getUserByUsername(currentUser);
    }
    return null;
}

function getCourseById(courseId) {
    const allCourses = JSON.parse(localStorage.getItem('allCourses')) || [];
    return allCourses.find(course => course.id === courseId) || null;
}

function getCurrentUserProfile() {
    return currentStudentProfileCache;
}

function getResolvedRollNo() {
    const profile = getCurrentUserProfile() || {};
    return profile.rollNo || profile.rollNumber || '';
}

function getAdvisorDetails() {
    const userRecord = getCurrentUserRecord() || {};
    return {
        name: userRecord.advisorName || DEFAULT_ADVISOR.name,
        department: userRecord.advisorDepartment || DEFAULT_ADVISOR.department,
        email: userRecord.advisorEmail || DEFAULT_ADVISOR.email
    };
}

function getPaymentDetails() {
    const userRecord = getCurrentUserRecord() || {};
    const due = Number.isFinite(userRecord.outstandingFees) ? userRecord.outstandingFees : ((userRecord.baseCredits || 0) * 1200);
    return {
        outstanding: due,
        status: due > 0 ? 'Pending' : 'Clear'
    };
}

function getNotificationStore() {
    return JSON.parse(localStorage.getItem('portalNotifications')) || {};
}

function saveNotificationStore(store) {
    localStorage.setItem('portalNotifications', JSON.stringify(store));
}

function addNotification(message, type = 'info') {
    const store = getNotificationStore();
    if (!store[currentUser]) {
        store[currentUser] = [];
    }
    store[currentUser].unshift({
        id: Date.now(),
        type,
        message,
        createdAt: new Date().toLocaleString(),
        read: false
    });
    saveNotificationStore(store);
}

function markNotificationsRead() {
    const store = getNotificationStore();
    if (!store[currentUser]) {
        return;
    }
    store[currentUser] = store[currentUser].map(item => ({ ...item, read: true }));
    saveNotificationStore(store);
}

function getPrerequisiteNames(course) {
    const prerequisites = Array.isArray(course && course.prerequisites) ? course.prerequisites : [];
    return prerequisites.map(id => getCourseById(id)?.name).filter(Boolean);
}

function populateDepartmentFilter() {
    const select = document.getElementById('departmentFilter');
    if (!select) {
        return;
    }
    const courses = JSON.parse(localStorage.getItem('allCourses')) || [];
    const departments = [...new Set(courses.map(course => course.department).filter(Boolean))].sort();
    const currentValue = select.value || PORTAL_STATE.department;
    select.innerHTML = '<option value="all">All Departments</option>' + departments.map(
        department => `<option value="${department}">${department}</option>`
    ).join('');
    select.value = departments.includes(currentValue) || currentValue === 'all' ? currentValue : 'all';
}

function getCurrentEnrolledCredits() {
    const myEnrolledIds = getUserEnrollments();
    return myEnrolledIds.reduce((total, courseId) => {
        const course = getCourseById(courseId);
        return total + (course && Number.isFinite(course.credits) ? course.credits : 0);
    }, 0);
}

function hasTimeConflict(course, enrolledCourses) {
    if (!course || !course.timeSlot) {
        return false;
    }
    return enrolledCourses.some(enrolled => enrolled.timeSlot && enrolled.timeSlot === course.timeSlot);
}

function getRegistrationValidation(course) {
    const userRecord = getCurrentUserRecord();
    const myEnrolledIds = getUserEnrollments();
    const enrolledCourses = myEnrolledIds
        .map(id => getCourseById(id))
        .filter(Boolean);

    if (!course) {
        return { allowed: false, message: 'Course not found.' };
    }

    if (myEnrolledIds.includes(course.id)) {
        return { allowed: false, message: 'Already enrolled.' };
    }

    if (userRecord && userRecord.hasHold) {
        return { allowed: false, message: 'Registration hold active.' };
    }

    const completedCourseIds = userRecord && Array.isArray(userRecord.completedCourseIds)
        ? userRecord.completedCourseIds
        : [];
    const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : [];
    const missingPrerequisites = prerequisites.filter(id => !completedCourseIds.includes(id));
    if (missingPrerequisites.length > 0) {
        return { allowed: false, message: 'Missing prerequisites.' };
    }

    if (hasTimeConflict(course, enrolledCourses)) {
        return { allowed: false, message: 'Schedule conflict.' };
    }

    const baseCredits = userRecord && Number.isFinite(userRecord.baseCredits) ? userRecord.baseCredits : 0;
    const maxCredits = userRecord && Number.isFinite(userRecord.maxCredits) ? userRecord.maxCredits : 24;
    const courseCredits = Number.isFinite(course.credits) ? course.credits : 0;
    const totalCreditsIfEnrolled = baseCredits + getCurrentEnrolledCredits() + courseCredits;
    if (totalCreditsIfEnrolled > maxCredits) {
        return { allowed: false, message: 'Credit limit exceeded.' };
    }

    if (myEnrolledIds.length >= 5) {
        return { allowed: false, message: 'You can enroll in up to 5 courses only.' };
    }

    const seatsLeft = course.totalSeats - course.enrolledCount;
    if (seatsLeft <= 0) {
        return { allowed: false, message: 'Course full.' };
    }

    return { allowed: true, message: 'Eligible to enroll.' };
}

function initializeAttendanceForCurrentUser() {
    const attendanceKey = `attendance:${currentUser}`;
    if (localStorage.getItem(attendanceKey)) {
        return;
    }

    const mockAttendance = {};
    ATTENDANCE_SUBJECTS.forEach((subject, index) => {
        const base = 68 + ((index * 7) % 26);
        mockAttendance[subject] = Math.min(95, base);
    });

    localStorage.setItem(attendanceKey, JSON.stringify(mockAttendance));
}

function buildAttendanceEntriesFromPercentages(attendance) {
    return ATTENDANCE_SUBJECTS.map(subject => {
        const percent = Number.isFinite(attendance[subject]) ? attendance[subject] : 0;
        return {
            subject,
            percent,
            attendedClasses: percent,
            totalClasses: 100
        };
    });
}

function renderAttendanceEntries(entries) {
    const listContainer = document.getElementById('attendanceList');
    const summaryContainer = document.getElementById('attendanceSummary');
    const chartContainer = document.getElementById('attendanceBarChart');
    if (!listContainer || !summaryContainer || !chartContainer) {
        return;
    }

    const total = entries.reduce((sum, item) => sum + item.percent, 0);
    const average = entries.length > 0 ? (total / entries.length) : 0;
    const minItem = entries.reduce((min, item) => item.percent < min.percent ? item : min, entries[0]);
    const maxItem = entries.reduce((max, item) => item.percent > max.percent ? item : max, entries[0]);
    const above75 = entries.filter(item => item.percent >= 75).length;
    const angle = Math.round((Math.max(0, Math.min(100, average)) / 100) * 360);

    summaryContainer.innerHTML = `
        <div class="attendance-kpi">
            <h3>Average Attendance</h3>
            <p>${average.toFixed(1)}%</p>
            <div class="attendance-donut" style="--angle: ${angle}deg;"></div>
        </div>
        <div class="attendance-kpi">
            <h3>Best Subject</h3>
            <p>${maxItem.subject}</p>
        </div>
        <div class="attendance-kpi">
            <h3>Needs Improvement</h3>
            <p>${minItem.subject}</p>
        </div>
        <div class="attendance-kpi">
            <h3>Subjects Above 75%</h3>
            <p>${above75}/${entries.length}</p>
        </div>
    `;

    chartContainer.innerHTML = entries.map(item => `
        <div class="att-bar-row">
            <span class="att-bar-label">${item.subject}</span>
            <div class="att-bar-track">
                <span class="att-bar-fill" style="width: ${item.percent}%;"></span>
            </div>
            <span class="att-bar-value">${item.percent}%</span>
        </div>
    `).join('');

    listContainer.innerHTML = entries.map(item => {
        const badgeClass = item.percent >= 80 ? 'good' : (item.percent >= 75 ? 'warn' : 'risk');
        const badgeText = item.percent >= 80 ? 'Safe' : (item.percent >= 75 ? 'Borderline' : 'Low');
        return `
            <div class="attendance-card">
                <h3>${item.subject}</h3>
                <div class="attendance-row">
                    <span>Attendance</span>
                    <strong>${item.percent}%</strong>
                </div>
                <div class="attendance-row">
                    <span>Classes</span>
                    <strong>${item.attendedClasses}/${item.totalClasses}</strong>
                </div>
                <div class="attendance-progress">
                    <span style="width: ${item.percent}%;"></span>
                </div>
                <span class="att-badge ${badgeClass}">${badgeText}</span>
            </div>
        `;
    }).join('');
}

async function loadAttendance() {
    const listContainer = document.getElementById('attendanceList');
    const summaryContainer = document.getElementById('attendanceSummary');
    const chartContainer = document.getElementById('attendanceBarChart');
    if (!listContainer || !summaryContainer || !chartContainer) {
        return;
    }

    const lookupInput = document.getElementById('attendanceRollLookup');
    const resolvedRollNo = (lookupInput && lookupInput.value.trim()) || getResolvedRollNo();

    if (lookupInput && !lookupInput.value.trim() && resolvedRollNo) {
        lookupInput.value = resolvedRollNo;
    }

    try {
        const data = resolvedRollNo
            ? await apiRequest(`/api/students/attendance/roll/${encodeURIComponent(resolvedRollNo)}`)
            : await apiRequest(`/api/students/${encodeURIComponent(currentUser)}/attendance`);
        const entries = (data.attendance || []).map(item => ({
            subject: item.subject,
            percent: Number(item.percentage || 0),
            attendedClasses: Number(item.attendedClasses || 0),
            totalClasses: Number(item.totalClasses || 0)
        }));
        renderAttendanceEntries(entries);
    } catch (error) {
        initializeAttendanceForCurrentUser();
        const attendance = JSON.parse(localStorage.getItem(`attendance:${currentUser}`)) || {};
        renderAttendanceEntries(buildAttendanceEntriesFromPercentages(attendance));
    }
}

async function loadMarks() {
    const summaryContainer = document.getElementById('marksSummary');
    const listContainer = document.getElementById('marksList');
    if (!summaryContainer || !listContainer) {
        return;
    }

    try {
        const data = await apiRequest(`/api/students/${encodeURIComponent(currentUser)}/marks`);
        const marks = data.marks || [];
        const attempted = marks.filter(item => item.maxScore > 0 && item.score > 0);
        const average = attempted.length
            ? (attempted.reduce((sum, item) => sum + item.percentage, 0) / attempted.length).toFixed(1)
            : '0.0';
        const best = marks.reduce((max, item) => item.percentage > max.percentage ? item : max, marks[0] || { subject: '-', percentage: 0 });

        summaryContainer.innerHTML = `
            <div class="overview-card">
                <h3>Subjects Evaluated</h3>
                <p><strong>${attempted.length}</strong><br>subjects with uploaded marks</p>
            </div>
            <div class="overview-card">
                <h3>Average Score</h3>
                <p><strong>${average}%</strong><br>across evaluated subjects</p>
            </div>
            <div class="overview-card">
                <h3>Best Subject</h3>
                <p><strong>${best.subject || '-'}</strong><br>${best.percentage || 0}%</p>
            </div>
        `;

        listContainer.innerHTML = marks.map(item => `
            <div class="course-card">
                <h3>${item.subject}</h3>
                <p><strong>Marks:</strong> ${item.score}/${item.maxScore}</p>
                <p><strong>Percentage:</strong> ${item.percentage}%</p>
                <p class="seats-info ${item.percentage >= 75 ? '' : (item.percentage >= 40 ? 'low' : 'full')}">
                    ${item.percentage >= 75 ? 'Strong performance' : (item.percentage >= 40 ? 'Can improve' : 'Needs support')}
                </p>
            </div>
        `).join('');
    } catch (error) {
        summaryContainer.innerHTML = `
            <div class="overview-card">
                <h3>Marks Unavailable</h3>
                <p>${error.message}</p>
            </div>
        `;
        listContainer.innerHTML = '<p class="empty-message">No marks uploaded yet.</p>';
    }
}

async function loadStudentRanking() {
    const tableBody = document.getElementById('rankingTableBody');
    if (!tableBody) {
        return;
    }

    let rankedStudents = [];
    try {
        const data = await apiRequest('/api/students');
        rankedStudents = data.students || [];
    } catch (error) {
        rankedStudents = typeof dataService !== 'undefined' && typeof dataService.getRankedStudents === 'function'
            ? dataService.getRankedStudents()
            : [];
    }

    if (rankedStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No student data available.</td></tr>';
        return;
    }

    tableBody.innerHTML = rankedStudents.map(student => `
        <tr>
            <td>${student.rank}</td>
            <td>${student.name || student.username}</td>
            <td>${student.rollNumber || '-'}</td>
            <td>${Number(student.cpi).toFixed(2)}</td>
            <td>${student.preferredCourse || '-'}</td>
        </tr>
    `).join('');
}

// Get user's enrolled courses
function getUserEnrollments() {
    const allEnrollments = JSON.parse(localStorage.getItem('enrollments'));
    return allEnrollments[currentUser] || [];
}

// Load enrolled courses (backend-ready)
function loadMyCourses() {
    const allCourses = JSON.parse(localStorage.getItem('allCourses'));
    const myEnrolledIds = getUserEnrollments();
    const myCourses = allCourses.filter(course => myEnrolledIds.includes(course.id));
    
    const container = document.getElementById('myCoursesList');
    const summary = document.getElementById('scheduleSummary');

    if (summary) {
        const totalCredits = myCourses.reduce((sum, course) => sum + (course.credits || 0), 0);
        const remainingCourseSlots = Math.max(0, 5 - myCourses.length);
        const scheduleItems = myCourses
            .slice()
            .sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''))
            .map(course => `<li>${course.timeSlot || 'TBD'} - ${course.name}</li>`)
            .join('');

        summary.innerHTML = `
            <div class="schedule-card">
                <h3>Weekly Schedule</h3>
                ${myCourses.length ? `<ul>${scheduleItems}</ul>` : '<p>No classes added to your schedule yet.</p>'}
            </div>
            <div class="schedule-card">
                <h3>Course Load</h3>
                <p><strong>${myCourses.length}/5</strong> courses selected.<br>${totalCredits} total credits.<br>${remainingCourseSlots} slot(s) remaining.</p>
            </div>
        `;
    }
    
    if (myCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">You have not enrolled in any courses yet.</p>';
    } else {
        container.innerHTML = myCourses.map(course => {
            const prerequisiteNames = getPrerequisiteNames(course);
            return `
                <div class="course-card">
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                    <p><strong>Instructor:</strong> ${course.instructor}</p>
                    <p><strong>Department:</strong> ${course.department || 'General'}</p>
                    <p><strong>Schedule:</strong> ${course.timeSlot || 'TBD'}</p>
                    <p><strong>Credits:</strong> ${course.credits || 0}</p>
                    <p><strong>Prerequisites:</strong> ${prerequisiteNames.length ? prerequisiteNames.join(', ') : 'None'}</p>
                    <p class="seats-info">Seats: ${course.enrolledCount}/${course.totalSeats} enrolled</p>
                    <button class="enrolled" onclick="unenrollCourse(${course.id})">Unenroll</button>
                </div>
            `;
        }).join('');
    }
}

// Load new/available courses
function loadNewCourses() {
    const allCourses = JSON.parse(localStorage.getItem('allCourses'));
    const myEnrolledIds = getUserEnrollments();
    const term = PORTAL_STATE.courseSearch.trim().toLowerCase();
    const availableCourses = allCourses
        .filter(course => !myEnrolledIds.includes(course.id))
        .filter(course => {
            const matchesSearch = !term || [course.name, course.description, course.instructor, course.department]
                .filter(Boolean)
                .some(value => value.toLowerCase().includes(term));
            const matchesDepartment = PORTAL_STATE.department === 'all' || course.department === PORTAL_STATE.department;
            const matchesCredits = PORTAL_STATE.credits === 'all' || String(course.credits) === PORTAL_STATE.credits;
            return matchesSearch && matchesDepartment && matchesCredits;
        })
        .sort((a, b) => {
            if (PORTAL_STATE.sortBy === 'credits') {
                return (b.credits || 0) - (a.credits || 0) || a.name.localeCompare(b.name);
            }
            if (PORTAL_STATE.sortBy === 'seats') {
                return (b.totalSeats - b.enrolledCount) - (a.totalSeats - a.enrolledCount) || a.name.localeCompare(b.name);
            }
            return a.name.localeCompare(b.name);
        });

    const container = document.getElementById('newCoursesList');

    if (availableCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">No courses match your current search or filter.</p>';
    } else {
        container.innerHTML = availableCourses.map(course => {
            const seatsLeft = course.totalSeats - course.enrolledCount;
            const validation = getRegistrationValidation(course);
            const prerequisiteNames = getPrerequisiteNames(course);

            let seatClass = '';
            if (seatsLeft <= 0) seatClass = 'full';
            else if (seatsLeft <= 5) seatClass = 'low';

            const buttonLabel = validation.allowed ? 'Enroll Now' : validation.message;
            const buttonAction = validation.allowed ? `enrollCourse(${course.id})` : '';
            const buttonDisabled = validation.allowed ? '' : 'disabled';

            return `
                <div class="course-card">
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                    <p><strong>Instructor:</strong> ${course.instructor}</p>
                    <p><strong>Department:</strong> ${course.department || 'General'}</p>
                    <p><strong>Credits:</strong> ${course.credits || 0}</p>
                    <p><strong>Time Slot:</strong> ${course.timeSlot || 'TBD'}</p>
                    <p><strong>Prerequisites:</strong> ${prerequisiteNames.length ? prerequisiteNames.join(', ') : 'None'}</p>
                    <p class="seats-info ${seatClass}">${seatsLeft} seats left (${course.enrolledCount}/${course.totalSeats} enrolled)</p>
                    <button onclick="${buttonAction}" ${buttonDisabled}>
                        ${buttonLabel}
                    </button>
                </div>
            `;
        }).join('');
    }
}

// Enroll in a course (backend-ready structure)
function enrollCourse(courseId) {
    const allEnrollments = JSON.parse(localStorage.getItem('enrollments'));
    const allCourses = JSON.parse(localStorage.getItem('allCourses'));
    
    // Find the course and validate registration rules
    const course = allCourses.find(c => c.id === courseId);
    const validation = getRegistrationValidation(course);
    if (!validation.allowed) {
        alert(validation.message);
        return;
    }
    
    // Enroll user (backend-ready: in future this will be API call)
    if (!allEnrollments[currentUser]) {
        allEnrollments[currentUser] = [];
    }
    allEnrollments[currentUser].push(courseId);
    localStorage.setItem('enrollments', JSON.stringify(allEnrollments));
    
    // Update seat count (backend-ready: will be handled by backend)
    course.enrolledCount++;
    localStorage.setItem('allCourses', JSON.stringify(allCourses));

    addNotification(`Enrollment confirmed for ${course.name}.`, 'success');
    alert('Enrolled successfully!');
    loadNewCourses();
    
    // If on My Courses section, refresh it too
    if (!document.getElementById('coursesSection').classList.contains('hidden')) {
        loadMyCourses();
    }
}

// Unenroll from a course (backend-ready structure)
function unenrollCourse(courseId) {
    // Confirm before unenrolling
    if (!confirm('Are you sure you want to unenroll from this course?')) {
        return;
    }
    
    const allEnrollments = JSON.parse(localStorage.getItem('enrollments'));
    const allCourses = JSON.parse(localStorage.getItem('allCourses'));
    
    // Remove enrollment (backend-ready: in future this will be API call)
    if (allEnrollments[currentUser]) {
        const index = allEnrollments[currentUser].indexOf(courseId);
        if (index > -1) {
            allEnrollments[currentUser].splice(index, 1);
            localStorage.setItem('enrollments', JSON.stringify(allEnrollments));
            
            // Update seat count (backend-ready: will be handled by backend)
            const course = allCourses.find(c => c.id === courseId);
            if (course && course.enrolledCount > 0) {
                course.enrolledCount--;
                localStorage.setItem('allCourses', JSON.stringify(allCourses));
            }
            
            addNotification(`You dropped ${course ? course.name : 'a course'}.`, 'info');
            alert('Unenrolled successfully!');
            loadMyCourses();
            
            // If on New Courses section, refresh it too
            if (!document.getElementById('newcoursesSection').classList.contains('hidden')) {
                loadNewCourses();
            }
        }
    }
}

async function loadNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) {
        return;
    }

    const localNotifications = (getNotificationStore()[currentUser] || []).map(item => ({
        id: `local-${item.id}`,
        title: item.type === 'success' ? 'Update' : 'Notification',
        message: item.message,
        createdAt: item.createdAt,
        sortTime: Number(item.id) || Date.now(),
        read: item.read,
        hasPdf: false,
        pdfUrl: '',
        meta: ''
    }));

    let announcementNotifications = [];
    try {
        const data = await apiRequest(`/api/students/${encodeURIComponent(currentUser)}/announcements`);
        announcementNotifications = (data.announcements || []).map(item => ({
            id: `announcement-${item.id}`,
            title: item.title || 'Faculty Announcement',
            message: item.message,
            createdAt: new Date(item.createdAt).toLocaleString('en-IN'),
            sortTime: new Date(item.createdAt).getTime() || Date.now(),
            read: false,
            hasPdf: item.hasPdf,
            pdfUrl: item.hasPdf ? `/api/announcements/${item.id}/file` : '',
            meta: item.facultyName
                ? `From ${item.facultyName}${item.targetRollNo ? ` for roll no ${item.targetRollNo}` : ''}`
                : (item.targetRollNo ? `For roll no ${item.targetRollNo}` : 'Faculty broadcast')
        }));
    } catch (error) {
        announcementNotifications = [{
            id: 'announcement-error',
            title: 'Faculty Announcements',
            message: `Unable to load faculty announcements right now: ${error.message}`,
            createdAt: new Date().toLocaleString('en-IN'),
            sortTime: Date.now(),
            read: true,
            hasPdf: false,
            pdfUrl: '',
            meta: 'Backend sync unavailable'
        }];
    }

    const notifications = [...announcementNotifications, ...localNotifications]
        .sort((left, right) => right.sortTime - left.sortTime);

    if (notifications.length === 0) {
        container.innerHTML = '<p class="empty-message">No notifications yet.</p>';
        return;
    }

    container.innerHTML = notifications.map(item => `
        <div class="notification-card ${item.read ? '' : 'unread'}">
            <h3>${escapeHtml(item.title)}</h3>
            ${item.meta ? `<p><strong>${escapeHtml(item.meta)}</strong></p>` : ''}
            <p>${escapeHtml(item.message)}</p>
            ${item.hasPdf ? `<p><a href="${item.pdfUrl}" target="_blank" rel="noopener noreferrer">Open attached PDF</a></p>` : ''}
            <time>${item.createdAt}</time>
        </div>
    `).join('');

    markNotificationsRead();
}

function loadAcademicCalendar() {
    const intro = document.getElementById('calendarIntro');
    const highlights = document.getElementById('calendarHighlights');
    const legend = document.getElementById('calendarLegend');
    const months = document.getElementById('calendarMonths');
    const timeline = document.getElementById('calendarTimeline');

    if (!intro || !highlights || !legend || !months || !timeline) {
        return;
    }

    intro.innerHTML = `
        <div class="schedule-card">
            <h3>${ACADEMIC_CALENDAR.title}</h3>
            <p>${ACADEMIC_CALENDAR.location}</p>
            <p>Source: <a href="${ACADEMIC_CALENDAR.sourceUrl}" target="_blank" rel="noopener noreferrer">${ACADEMIC_CALENDAR.sourceLabel}</a></p>
            <p>This view shows key semester milestones so students can quickly check important academic dates.</p>
        </div>
    `;

    highlights.innerHTML = ACADEMIC_CALENDAR.highlights.map(item => `
        <div class="overview-card">
            <h3>${item.label}</h3>
            <p><strong>${item.value}</strong></p>
        </div>
    `).join('');

    legend.innerHTML = Object.entries(ACADEMIC_CALENDAR.eventTypes).map(([key, label]) => `
        <span class="calendar-legend-item ${key}">
            <span class="calendar-legend-dot"></span>${label}
        </span>
    `).join('');

    months.innerHTML = buildAcademicCalendarMonths();

    timeline.innerHTML = ACADEMIC_CALENDAR.events.map(event => `
        <div class="schedule-card calendar-card">
            <h3>${event.title}</h3>
            <p><strong>${formatEventDateRange(event.start, event.end)}</strong></p>
            <p class="calendar-type ${event.type}">${ACADEMIC_CALENDAR.eventTypes[event.type]}</p>
        </div>
    `).join('');
}

function buildAcademicCalendarMonths() {
    const monthCards = [];
    const { start, end } = ACADEMIC_CALENDAR.monthRange;
    const cursor = new Date(start.year, start.month, 1);
    const finalDate = new Date(end.year, end.month, 1);

    while (cursor <= finalDate) {
        monthCards.push(renderMonthCard(cursor.getFullYear(), cursor.getMonth()));
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return monthCards.join('');
}

function renderMonthCard(year, month) {
    const monthDate = new Date(year, month, 1);
    const monthName = monthDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const firstWeekday = monthDate.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cells = [];

    weekdayLabels.forEach(day => {
        cells.push(`<div class="day-head">${day}</div>`);
    });

    for (let i = 0; i < firstWeekday; i++) {
        cells.push('<div class="day-cell empty" aria-hidden="true"></div>');
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = getEventsForDate(isoDate);
        const badges = dayEvents.slice(0, 2).map(event => `
            <span class="calendar-chip ${event.type}" title="${event.title}">${ACADEMIC_CALENDAR.eventTypes[event.type]}</span>
        `).join('');
        const extraCount = dayEvents.length > 2 ? `<span class="calendar-chip more">+${dayEvents.length - 2}</span>` : '';
        const eventClass = dayEvents.length ? `has-event ${dayEvents[0].type}` : '';

        cells.push(`
            <div class="day-cell ${eventClass}">
                <span class="day-number">${day}</span>
                <div class="day-events">
                    ${badges}
                    ${extraCount}
                </div>
            </div>
        `);
    }

    return `
        <section class="month-card">
            <div class="month-header">${monthName}</div>
            <div class="month-grid">
                ${cells.join('')}
            </div>
        </section>
    `;
}

function getEventsForDate(isoDate) {
    const target = new Date(`${isoDate}T00:00:00`);
    return ACADEMIC_CALENDAR.events.filter(event => {
        const start = new Date(`${event.start}T00:00:00`);
        const end = new Date(`${event.end}T00:00:00`);
        return target >= start && target <= end;
    });
}

function formatEventDateRange(startIso, endIso) {
    const start = new Date(`${startIso}T00:00:00`);
    const end = new Date(`${endIso}T00:00:00`);
    const startLabel = start.toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const endLabel = end.toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    return startIso === endIso ? startLabel : `${startLabel} to ${endLabel}`;
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

document.getElementById('courseSearch').addEventListener('input', function() {
    PORTAL_STATE.courseSearch = this.value;
    loadNewCourses();
});

document.getElementById('departmentFilter').addEventListener('change', function() {
    PORTAL_STATE.department = this.value;
    loadNewCourses();
});

document.getElementById('creditFilter').addEventListener('change', function() {
    PORTAL_STATE.credits = this.value;
    loadNewCourses();
});

document.getElementById('sortCourses').addEventListener('change', function() {
    PORTAL_STATE.sortBy = this.value;
    loadNewCourses();
});

// Load student form by default after login
initializeTheme();
document.querySelectorAll('.theme-option').forEach(button => {
    button.addEventListener('click', () => setTheme(button.dataset.themeChoice));
});
document.getElementById('attendanceLookupBtn').addEventListener('click', () => {
    loadAttendance();
});
initializeDashboardData().finally(() => {
    const lookupInput = document.getElementById('attendanceRollLookup');
    const rollNo = getResolvedRollNo();
    if (lookupInput && rollNo) {
        lookupInput.value = rollNo;
    }
    showSection('courses');
});

