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

function showStudentFormMessage(text, type) {
    const message = document.getElementById('studentFormMessage');
    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove('success', 'error');
    if (type) {
        message.classList.add(type);
    }
}

async function initializeDashboardData() {
    try {
        const [{ user }, { profile }] = await Promise.all([
            apiRequest(`/api/users/${encodeURIComponent(currentUser)}`),
            apiRequest(`/api/students/${encodeURIComponent(currentUser)}`)
        ]);

        currentUserRecordCache = user;
        currentStudentProfileCache = profile;
    } catch (error) {
        currentUserRecordCache = typeof dataService !== 'undefined' && typeof dataService.getUserByUsername === 'function'
            ? dataService.getUserByUsername(currentUser)
            : null;
        currentStudentProfileCache = null;
        showStudentFormMessage(`Backend sync unavailable: ${error.message}`, 'error');
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

function initializeWaitlists() {
    if (!localStorage.getItem('waitlists')) {
        localStorage.setItem('waitlists', JSON.stringify({}));
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
initializeWaitlists();
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

    if (section === 'student') {
        document.getElementById('studentSection').classList.remove('hidden');
        populateCourseOptions();
        loadStudentProfile();
        renderStudentOverview();
    } else if (section === 'courses') {
        document.getElementById('coursesSection').classList.remove('hidden');
        loadMyCourses();
    } else if (section === 'newcourses') {
        document.getElementById('newcoursesSection').classList.remove('hidden');
        populateDepartmentFilter();
        loadNewCourses();
    } else if (section === 'waitlist') {
        document.getElementById('waitlistSection').classList.remove('hidden');
        loadWaitlist();
    } else if (section === 'notifications') {
        document.getElementById('notificationsSection').classList.remove('hidden');
        loadNotifications();
    } else if (section === 'calendar') {
        document.getElementById('calendarSection').classList.remove('hidden');
        loadAcademicCalendar();
    } else if (section === 'attendance') {
        document.getElementById('attendanceSection').classList.remove('hidden');
        loadAttendance();
    } else if (section === 'ranking') {
        document.getElementById('rankingSection').classList.remove('hidden');
        loadStudentRanking();
    }
}

function populateCourseOptions() {
    const select = document.getElementById('studentCourses');
    const allCourses = JSON.parse(localStorage.getItem('allCourses')) || [];
    const selectedValues = Array.from(select.selectedOptions).map(option => option.value);

    select.innerHTML = '';
    allCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = course.name;
        if (selectedValues.includes(course.name)) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function loadStudentProfile() {
    const data = getCurrentUserProfile();
    if (!data) {
        document.getElementById('studentName').value = '';
        document.getElementById('studentRoll').value = '';
        document.getElementById('studentGender').value = '';
        document.getElementById('studentCpi').value = '';
        updateRankMessage();
        return;
    }
    document.getElementById('studentName').value = data.name || '';
    document.getElementById('studentRoll').value = data.rollNo || '';
    document.getElementById('studentGender').value = data.gender || '';
    document.getElementById('studentCpi').value = data.cpi || '';
    const preferredCourses = Array.isArray(data.preferredCourses)
        ? data.preferredCourses
        : (data.course ? [data.course] : []);
    const courseSelect = document.getElementById('studentCourses');
    Array.from(courseSelect.options).forEach(option => {
        option.selected = preferredCourses.includes(option.value);
    });
    updateRankMessage();
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

function getAllWaitlists() {
    return JSON.parse(localStorage.getItem('waitlists')) || {};
}

function getWaitlistForCourse(courseId) {
    const allWaitlists = getAllWaitlists();
    return allWaitlists[courseId] || [];
}

function getMyWaitlistedCourseIds() {
    const allWaitlists = getAllWaitlists();
    return Object.entries(allWaitlists)
        .filter(([, usernames]) => usernames.includes(currentUser))
        .map(([courseId]) => Number(courseId));
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

    const seatsLeft = course.totalSeats - course.enrolledCount;
    if (seatsLeft <= 0) {
        return { allowed: false, message: 'Course full.' };
    }

    return { allowed: true, message: 'Eligible to enroll.' };
}

function updateRankMessage() {
    const messageElement = document.getElementById('studentRankMessage');
    if (!messageElement) {
        return;
    }
    const userRecord = getCurrentUserRecord();
    if (!userRecord) {
        messageElement.textContent = '';
        return;
    }
    const holdText = userRecord.hasHold ? 'Active hold' : 'No hold';
    const maxCredits = Number.isFinite(userRecord.maxCredits) ? userRecord.maxCredits : 24;
    const usedCredits = (Number.isFinite(userRecord.baseCredits) ? userRecord.baseCredits : 0) + getCurrentEnrolledCredits();
    messageElement.textContent = `Registration status: ${holdText} | Credits used: ${usedCredits}/${maxCredits}`;
}

function renderStudentOverview() {
    const container = document.getElementById('studentOverview');
    if (!container) {
        return;
    }

    const userRecord = getCurrentUserRecord() || {};
    const profile = getCurrentUserProfile() || {};
    const advisor = getAdvisorDetails();
    const payment = getPaymentDetails();
    const usedCredits = (Number.isFinite(userRecord.baseCredits) ? userRecord.baseCredits : 0) + getCurrentEnrolledCredits();
    const maxCredits = Number.isFinite(userRecord.maxCredits) ? userRecord.maxCredits : 24;
    const waitlistCount = getMyWaitlistedCourseIds().length;

    container.innerHTML = `
        <div class="overview-card">
            <h3>Program</h3>
            <p><strong>${userRecord.program || 'B.Tech Computer Science'}</strong><br>${userRecord.academicLevel || 'Undergraduate'}</p>
        </div>
        <div class="overview-card">
            <h3>Advisor</h3>
            <p><strong>${advisor.name}</strong><br>${advisor.department}<br>${advisor.email}</p>
        </div>
        <div class="overview-card">
            <h3>Registration Status</h3>
            <p><strong>${userRecord.hasHold ? 'Hold Active' : 'Eligible'}</strong><br>Credits: ${usedCredits}/${maxCredits}<br>Waitlisted: ${waitlistCount}</p>
        </div>
        <div class="overview-card">
            <h3>Payment Summary</h3>
            <p><strong>${payment.status}</strong><br>Outstanding: Rs. ${payment.outstanding.toLocaleString()}<br>Student: ${profile.name || currentUser}</p>
        </div>
    `;
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

function loadAttendance() {
    initializeAttendanceForCurrentUser();
    const listContainer = document.getElementById('attendanceList');
    const summaryContainer = document.getElementById('attendanceSummary');
    const chartContainer = document.getElementById('attendanceBarChart');
    if (!listContainer || !summaryContainer || !chartContainer) {
        return;
    }

    const attendance = JSON.parse(localStorage.getItem(`attendance:${currentUser}`)) || {};
    const entries = ATTENDANCE_SUBJECTS.map(subject => {
        const percent = Number.isFinite(attendance[subject]) ? attendance[subject] : 0;
        return { subject, percent };
    });

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
                <div class="attendance-progress">
                    <span style="width: ${item.percent}%;"></span>
                </div>
                <span class="att-badge ${badgeClass}">${badgeText}</span>
            </div>
        `;
    }).join('');
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
                <h3>Credit Load</h3>
                <p><strong>${totalCredits}</strong> enrolled credits this term.</p>
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
            const isFull = seatsLeft <= 0;
            const isLow = seatsLeft > 0 && seatsLeft <= 5;
            const validation = getRegistrationValidation(course);
            const waitlist = getWaitlistForCourse(course.id);
            const isWaitlisted = waitlist.includes(currentUser);
            const prerequisiteNames = getPrerequisiteNames(course);

            let seatClass = '';
            if (isFull) seatClass = 'full';
            else if (isLow) seatClass = 'low';

            const buttonLabel = validation.allowed
                ? 'Enroll Now'
                : (isFull ? (isWaitlisted ? `Waitlisted (#${waitlist.indexOf(currentUser) + 1})` : 'Join Waitlist') : validation.message);
            const buttonAction = validation.allowed
                ? `enrollCourse(${course.id})`
                : (isFull && !isWaitlisted ? `joinWaitlist(${course.id})` : '');
            const buttonDisabled = validation.allowed || (isFull && !isWaitlisted) ? '' : 'disabled';

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
                    <p><strong>Waitlist:</strong> ${waitlist.length} student(s)</p>
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
    loadWaitlist();
    updateRankMessage();
    renderStudentOverview();
    
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
                processWaitlistForCourse(course.id, course.name);
            }
            
            addNotification(`You dropped ${course ? course.name : 'a course'}.`, 'info');
            alert('Unenrolled successfully!');
            loadMyCourses();
            loadWaitlist();
            updateRankMessage();
            renderStudentOverview();
            
            // If on New Courses section, refresh it too
            if (!document.getElementById('newcoursesSection').classList.contains('hidden')) {
                loadNewCourses();
            }
        }
    }
}

function joinWaitlist(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
        return;
    }

    const validation = getRegistrationValidation(course);
    if (validation.allowed) {
        enrollCourse(courseId);
        return;
    }

    if (validation.message !== 'Course full.') {
        alert(validation.message);
        return;
    }

    const allWaitlists = getAllWaitlists();
    if (!allWaitlists[courseId]) {
        allWaitlists[courseId] = [];
    }
    if (!allWaitlists[courseId].includes(currentUser)) {
        allWaitlists[courseId].push(currentUser);
        localStorage.setItem('waitlists', JSON.stringify(allWaitlists));
        addNotification(`You joined the waitlist for ${course.name} at position ${allWaitlists[courseId].length}.`, 'info');
    }

    loadNewCourses();
    loadWaitlist();
    renderStudentOverview();
}

function processWaitlistForCourse(courseId, courseName) {
    const allWaitlists = getAllWaitlists();
    const queue = allWaitlists[courseId] || [];
    if (queue.length === 0) {
        return;
    }

    const nextUser = queue.shift();
    allWaitlists[courseId] = queue;
    localStorage.setItem('waitlists', JSON.stringify(allWaitlists));

    const enrollments = JSON.parse(localStorage.getItem('enrollments')) || {};
    if (!enrollments[nextUser]) {
        enrollments[nextUser] = [];
    }
    if (!enrollments[nextUser].includes(courseId)) {
        enrollments[nextUser].push(courseId);
        localStorage.setItem('enrollments', JSON.stringify(enrollments));
    }

    const notificationStore = getNotificationStore();
    if (!notificationStore[nextUser]) {
        notificationStore[nextUser] = [];
    }
    notificationStore[nextUser].unshift({
        id: Date.now(),
        type: 'success',
        message: `Seat available: you were automatically enrolled in ${courseName} from the waitlist.`,
        createdAt: new Date().toLocaleString(),
        read: false
    });
    saveNotificationStore(notificationStore);
}

function loadWaitlist() {
    const summary = document.getElementById('waitlistSummary');
    const container = document.getElementById('waitlistList');
    if (!summary || !container) {
        return;
    }

    const waitlistedIds = getMyWaitlistedCourseIds();
    const waitlistedCourses = waitlistedIds.map(id => getCourseById(id)).filter(Boolean);

    summary.innerHTML = `
        <div class="schedule-card">
            <h3>Waitlist Summary</h3>
            <p><strong>${waitlistedCourses.length}</strong> course(s) currently waiting for a seat.</p>
        </div>
    `;

    if (waitlistedCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">You are not on any waitlist right now.</p>';
        return;
    }

    container.innerHTML = waitlistedCourses.map(course => {
        const queue = getWaitlistForCourse(course.id);
        const position = queue.indexOf(currentUser) + 1;
        return `
            <div class="course-card">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <p><strong>Instructor:</strong> ${course.instructor}</p>
                <p><strong>Time Slot:</strong> ${course.timeSlot || 'TBD'}</p>
                <p><strong>Your Position:</strong> ${position}</p>
                <p class="seats-info low">Queue length: ${queue.length}</p>
            </div>
        `;
    }).join('');
}

function loadNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) {
        return;
    }

    const notifications = getNotificationStore()[currentUser] || [];
    if (notifications.length === 0) {
        container.innerHTML = '<p class="empty-message">No notifications yet.</p>';
        return;
    }

    container.innerHTML = notifications.map(item => `
        <div class="notification-card ${item.read ? '' : 'unread'}">
            <h3>${item.type === 'success' ? 'Update' : 'Notification'}</h3>
            <p>${item.message}</p>
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

// Student form handler
document.getElementById('studentForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const preferredCourses = Array.from(document.getElementById('studentCourses').selectedOptions)
        .map(option => option.value)
        .slice(0, 5);

    const studentData = {
        name: document.getElementById('studentName').value.trim(),
        rollNo: document.getElementById('studentRoll').value.trim(),
        gender: document.getElementById('studentGender').value,
        cpi: document.getElementById('studentCpi').value,
        preferredCourses
    };

    try {
        const response = await apiRequest(`/api/students/${encodeURIComponent(currentUser)}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });

        currentStudentProfileCache = response.profile;
        showStudentFormMessage('Student info saved successfully to MySQL.', 'success');
        updateRankMessage();
        renderStudentOverview();
        if (!document.getElementById('newcoursesSection').classList.contains('hidden')) {
            loadNewCourses();
        }
        if (!document.getElementById('rankingSection').classList.contains('hidden')) {
            loadStudentRanking();
        }
    } catch (error) {
        showStudentFormMessage(error.message, 'error');
    }
});

document.getElementById('studentCourses').addEventListener('change', function() {
    const selected = Array.from(this.selectedOptions);
    if (selected.length > 5) {
        selected[selected.length - 1].selected = false;
        alert('You can select up to 5 courses only.');
    }
    updateRankMessage();
});

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
initializeDashboardData().finally(() => {
    showSection('student');
});

