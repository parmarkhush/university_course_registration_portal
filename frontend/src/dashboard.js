// Check if user is logged in
const currentUser = localStorage.getItem('currentUser');

if (!currentUser) {
    // If no user, redirect to login
    window.location.href = 'index.html';
} else {
    // Display username
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser}!`;
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
        localStorage.setItem('allCourses', JSON.stringify(normalizedCourses));
    }
}

// Initialize enrollment data (backend-ready structure)
function initializeEnrollments() {
    if (!localStorage.getItem('enrollments')) {
        localStorage.setItem('enrollments', JSON.stringify({}));
    }
}

// Initialize data
initializeCourses();
initializeEnrollments();

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

// Switch sections
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    
    const activeMenu = document.querySelector(`.menu li[data-section="${section}"]`);
    if (activeMenu) {
        activeMenu.classList.add('active');
    }

    if (section === 'student') {
        document.getElementById('studentSection').classList.remove('hidden');
        populateCourseOptions();
        loadStudentProfile();
    } else if (section === 'courses') {
        document.getElementById('coursesSection').classList.remove('hidden');
        loadMyCourses();
    } else if (section === 'newcourses') {
        document.getElementById('newcoursesSection').classList.remove('hidden');
        loadNewCourses();
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
    const saved = localStorage.getItem(`studentProfile:${currentUser}`);
    if (!saved) {
        updateRankMessage();
        return;
    }
    const data = JSON.parse(saved);
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
    if (typeof dataService !== 'undefined' && typeof dataService.getUserByUsername === 'function') {
        return dataService.getUserByUsername(currentUser);
    }
    return null;
}

function getCourseById(courseId) {
    const allCourses = JSON.parse(localStorage.getItem('allCourses')) || [];
    return allCourses.find(course => course.id === courseId) || null;
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

function loadStudentRanking() {
    const tableBody = document.getElementById('rankingTableBody');
    if (!tableBody) {
        return;
    }

    const rankedStudents = typeof dataService !== 'undefined' && typeof dataService.getRankedStudents === 'function'
        ? dataService.getRankedStudents()
        : [];

    if (rankedStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No mock student data available.</td></tr>';
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
    
    if (myCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">You have not enrolled in any courses yet.</p>';
    } else {
        container.innerHTML = myCourses.map(course => {
            const seatsLeft = course.totalSeats - course.enrolledCount;
            return `
                <div class="course-card">
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                    <p><strong>Instructor:</strong> ${course.instructor}</p>
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
    const availableCourses = allCourses.filter(course => !myEnrolledIds.includes(course.id));

    const container = document.getElementById('newCoursesList');

    if (availableCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">No new courses available. You have enrolled in all courses!</p>';
    } else {
        container.innerHTML = availableCourses.map(course => {
            const seatsLeft = course.totalSeats - course.enrolledCount;
            const isFull = seatsLeft <= 0;
            const isLow = seatsLeft > 0 && seatsLeft <= 5;
            const validation = getRegistrationValidation(course);

            let seatClass = '';
            if (isFull) seatClass = 'full';
            else if (isLow) seatClass = 'low';

            const buttonLabel = validation.allowed ? 'Enroll Now' : validation.message;

            return `
                <div class="course-card">
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                    <p><strong>Instructor:</strong> ${course.instructor}</p>
                    <p><strong>Credits:</strong> ${course.credits || 0}</p>
                    <p><strong>Time Slot:</strong> ${course.timeSlot || 'TBD'}</p>
                    <p class="seats-info ${seatClass}">${seatsLeft} seats left (${course.enrolledCount}/${course.totalSeats} enrolled)</p>
                    <button onclick="enrollCourse(${course.id})" ${validation.allowed ? '' : 'disabled'}>
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
    
    alert('Enrolled successfully!');
    loadNewCourses();
    updateRankMessage();
    
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
            
            alert('Unenrolled successfully!');
            loadMyCourses();
            updateRankMessage();
            
            // If on New Courses section, refresh it too
            if (!document.getElementById('newcoursesSection').classList.contains('hidden')) {
                loadNewCourses();
            }
        }
    }
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Student form handler
document.getElementById('studentForm').addEventListener('submit', function(e) {
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

    localStorage.setItem(`studentProfile:${currentUser}`, JSON.stringify(studentData));

    const message = document.getElementById('studentFormMessage');
    message.textContent = 'Student info saved successfully.';
    message.classList.add('success');
    message.classList.remove('error');
    updateRankMessage();
    if (!document.getElementById('newcoursesSection').classList.contains('hidden')) {
        loadNewCourses();
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

// Load student form by default after login
showSection('student');

