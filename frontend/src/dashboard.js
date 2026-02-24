const currentUserId = Number(localStorage.getItem('currentUserId'));
const sessionExpiresAt = Number(localStorage.getItem('sessionExpiresAt'));

if (!currentUserId) {
    window.location.href = 'index.html';
    throw new Error('No logged in user.');
}

if (!sessionExpiresAt || Date.now() > sessionExpiresAt) {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('sessionExpiresAt');
    window.location.href = 'index.html';
    throw new Error('Session expired.');
}

portalDataService.init();

let state = portalDataService.read();
let currentUser = state.users.find(user => user.id === currentUserId);

if (!currentUser) {
    localStorage.removeItem('currentUserId');
    window.location.href = 'index.html';
    throw new Error('Invalid user session.');
}

document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}`;

function saveState() {
    portalDataService.syncEnrolledCounts(state);
    portalDataService.write(state);
}

function refreshUser() {
    currentUser = state.users.find(user => user.id === currentUserId);
}

function getMyEnrollments() {
    return state.enrollments.filter(enrollment => enrollment.userId === currentUserId);
}

function getMyCourseIds() {
    return getMyEnrollments().map(enrollment => enrollment.courseId);
}

function getCourseById(courseId) {
    return state.courses.find(course => course.id === courseId) || null;
}

function getAttendanceForCourse(courseId) {
    const userAttendance = state.attendance[currentUserId] || {};
    if (Number.isFinite(userAttendance[courseId])) {
        return userAttendance[courseId];
    }

    const percent = Math.floor(Math.random() * 21) + 75;
    state.attendance[currentUserId] = {
        ...userAttendance,
        [courseId]: percent
    };
    saveState();
    return percent;
}

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(node => node.classList.add('hidden'));
    document.querySelectorAll('.menu li[data-section]').forEach(node => node.classList.remove('active'));

    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }

    const menuElement = document.querySelector(`.menu li[data-section="${section}"]`);
    if (menuElement) {
        menuElement.classList.add('active');
    }

    if (section === 'available') {
        loadAvailableCourses();
    }
    if (section === 'mycourses') {
        loadMyCourses();
    }
    if (section === 'attendance') {
        loadAttendance();
    }
    if (section === 'profile') {
        loadProfile();
    }
}

function loadAvailableCourses() {
    const enrolledCourseIds = new Set(getMyCourseIds());
    const availableCourses = state.courses.filter(course => !enrolledCourseIds.has(course.id));
    const container = document.getElementById('availableCoursesList');

    if (availableCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">No available courses. You are enrolled in all courses.</p>';
        return;
    }

    container.innerHTML = availableCourses.map(course => {
        const seatsLeft = course.totalSeats - course.enrolledCount;
        const isFull = seatsLeft <= 0;

        return `
            <div class="course-card">
                <h3>${course.code} - ${course.name}</h3>
                <p><strong>Instructor:</strong> ${course.instructor}</p>
                <p><strong>Credits:</strong> ${course.credits}</p>
                <p class="seats-info ${isFull ? 'full' : ''}">${course.enrolledCount}/${course.totalSeats} seats filled</p>
                <button ${isFull ? 'disabled' : ''} onclick="openEnrollModal(${course.id})">
                    ${isFull ? 'Seats Full' : 'Enroll Course'}
                </button>
            </div>
        `;
    }).join('');
}

function loadMyCourses() {
    const myEnrollments = getMyEnrollments();
    const container = document.getElementById('myCoursesList');

    if (myEnrollments.length === 0) {
        container.innerHTML = '<p class="empty-message">You are not enrolled in any course.</p>';
        return;
    }

    container.innerHTML = myEnrollments.map(enrollment => {
        const course = getCourseById(enrollment.courseId);
        if (!course) {
            return '';
        }

        return `
            <div class="course-card">
                <h3>${course.code} - ${course.name}</h3>
                <p><strong>Instructor:</strong> ${course.instructor}</p>
                <p><strong>Credits:</strong> ${course.credits}</p>
                <p class="seats-info">${course.enrolledCount}/${course.totalSeats} seats filled</p>
                <button class="enrolled" onclick="unenrollCourse(${course.id})">Unenroll</button>
            </div>
        `;
    }).join('');
}

function loadAttendance() {
    const myCourseIds = getMyCourseIds();
    const container = document.getElementById('attendanceList');

    if (myCourseIds.length === 0) {
        container.innerHTML = '<p class="empty-message">Enroll in a course to view attendance.</p>';
        return;
    }

    container.innerHTML = myCourseIds.map(courseId => {
        const course = getCourseById(courseId);
        if (!course) {
            return '';
        }
        const percent = getAttendanceForCourse(courseId);
        const badgeClass = percent >= 85 ? 'good' : (percent >= 75 ? 'warn' : 'risk');

        return `
            <div class="attendance-card">
                <h3>${course.code} - ${course.name}</h3>
                <div class="attendance-row">
                    <span>Attendance</span>
                    <strong>${percent}%</strong>
                </div>
                <div class="attendance-progress">
                    <span style="width:${percent}%;"></span>
                </div>
                <span class="att-badge ${badgeClass}">${percent >= 85 ? 'Excellent' : (percent >= 75 ? 'On Track' : 'Low')}</span>
            </div>
        `;
    }).join('');
}

function loadProfile() {
    refreshUser();
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileRoll').value = currentUser.rollNumber;
    document.getElementById('profileEmail').value = currentUser.email;
}

function openEnrollModal(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
        return;
    }

    const seatsLeft = course.totalSeats - course.enrolledCount;
    if (seatsLeft <= 0) {
        return;
    }

    document.getElementById('regCourseId').value = String(course.id);
    document.getElementById('regRoll').value = currentUser.rollNumber;
    document.getElementById('regEmail').value = currentUser.email;
    document.getElementById('regCourse').value = `${course.code} - ${course.name}`;
    document.getElementById('regSeats').value = `${course.enrolledCount}/${course.totalSeats}`;
    document.getElementById('enrollMessage').textContent = '';
    document.getElementById('enrollModal').classList.remove('hidden');
}

function closeEnrollModal() {
    document.getElementById('enrollModal').classList.add('hidden');
}

function enrollCourse(courseId) {
    const myCourseIds = getMyCourseIds();
    if (myCourseIds.includes(courseId)) {
        return { ok: false, message: 'You are already enrolled in this course.' };
    }

    const course = getCourseById(courseId);
    if (!course) {
        return { ok: false, message: 'Course not found.' };
    }

    const seatsLeft = course.totalSeats - course.enrolledCount;
    if (seatsLeft <= 0) {
        return { ok: false, message: 'Cannot enroll. No seats available.' };
    }

    const nextId = state.enrollments.length > 0
        ? Math.max(...state.enrollments.map(item => item.id)) + 1
        : 1;

    state.enrollments.push({
        id: nextId,
        userId: currentUserId,
        courseId,
        enrolledOn: new Date().toISOString().slice(0, 10)
    });

    if (!state.attendance[currentUserId]) {
        state.attendance[currentUserId] = {};
    }
    state.attendance[currentUserId][courseId] = Math.floor(Math.random() * 21) + 75;

    saveState();
    return { ok: true, message: 'Enrolled successfully.' };
}

function unenrollCourse(courseId) {
    const index = state.enrollments.findIndex(
        enrollment => enrollment.userId === currentUserId && enrollment.courseId === courseId
    );

    if (index === -1) {
        return;
    }

    state.enrollments.splice(index, 1);

    if (state.attendance[currentUserId] && state.attendance[currentUserId][courseId] !== undefined) {
        delete state.attendance[currentUserId][courseId];
    }

    saveState();
    loadMyCourses();
    loadAvailableCourses();

    if (!document.getElementById('attendanceSection').classList.contains('hidden')) {
        loadAttendance();
    }
}

function logout() {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('sessionExpiresAt');
    window.location.href = 'index.html';
}

document.getElementById('enrollForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const courseId = Number(document.getElementById('regCourseId').value);
    const result = enrollCourse(courseId);
    const messageNode = document.getElementById('enrollMessage');

    messageNode.textContent = result.message;
    messageNode.classList.toggle('success', result.ok);
    messageNode.classList.toggle('error', !result.ok);

    if (!result.ok) {
        return;
    }

    loadAvailableCourses();
    if (!document.getElementById('mycoursesSection').classList.contains('hidden')) {
        loadMyCourses();
    }
    if (!document.getElementById('attendanceSection').classList.contains('hidden')) {
        loadAttendance();
    }

    setTimeout(() => {
        closeEnrollModal();
    }, 800);
});

document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const messageNode = document.getElementById('profileMessage');

    if (newPassword.length < 6) {
        messageNode.textContent = 'Password must be at least 6 characters.';
        messageNode.classList.add('error');
        messageNode.classList.remove('success');
        return;
    }

    if (newPassword !== confirmPassword) {
        messageNode.textContent = 'Passwords do not match.';
        messageNode.classList.add('error');
        messageNode.classList.remove('success');
        return;
    }

    const userIndex = state.users.findIndex(user => user.id === currentUserId);
    if (userIndex === -1) {
        messageNode.textContent = 'User not found.';
        messageNode.classList.add('error');
        messageNode.classList.remove('success');
        return;
    }

    state.users[userIndex].password = newPassword;
    saveState();
    refreshUser();

    messageNode.textContent = 'Password updated successfully.';
    messageNode.classList.add('success');
    messageNode.classList.remove('error');

    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
});

document.getElementById('enrollModal').addEventListener('click', function(e) {
    if (e.target.id === 'enrollModal') {
        closeEnrollModal();
    }
});

showSection('available');

window.showSection = showSection;
window.openEnrollModal = openEnrollModal;
window.closeEnrollModal = closeEnrollModal;
window.unenrollCourse = unenrollCourse;
window.logout = logout;
