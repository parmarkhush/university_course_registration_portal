// Check if user is logged in
const currentUser = localStorage.getItem('currentUser');

if (!currentUser) {
    // If no user, redirect to login
    window.location.href = 'index.html';
} else {
    // Display username
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser}!`;
}

// Initialize sample courses in localStorage (if not already done)
if (!localStorage.getItem('allCourses')) {
    const sampleCourses = [
        { id: 1, name: 'Data Structures', description: 'Learn fundamental data structures and algorithms', instructor: 'Dr. Smith' },
        { id: 2, name: 'Web Development', description: 'Build modern web applications with HTML, CSS, and JavaScript', instructor: 'Prof. Johnson' },
        { id: 3, name: 'Database Systems', description: 'Understanding relational databases and SQL', instructor: 'Dr. Williams' },
        { id: 4, name: 'Machine Learning', description: 'Introduction to ML algorithms and applications', instructor: 'Prof. Brown' },
        { id: 5, name: 'Computer Networks', description: 'Network protocols and architecture', instructor: 'Dr. Davis' },
        { id: 6, name: 'Mobile App Development', description: 'Create Android and iOS applications', instructor: 'Prof. Miller' }
    ];
    localStorage.setItem('allCourses', JSON.stringify(sampleCourses));
}

// Initialize user enrollments (if not already done)
if (!localStorage.getItem('enrollments')) {
    localStorage.setItem('enrollments', JSON.stringify({}));
}

// Switch sections
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    
    if (section === 'courses') {
        document.getElementById('coursesSection').classList.remove('hidden');
        document.querySelectorAll('.menu li')[0].classList.add('active');
        loadMyCourses();
    } else if (section === 'newcourses') {
        document.getElementById('newcoursesSection').classList.remove('hidden');
        document.querySelectorAll('.menu li')[1].classList.add('active');
        loadNewCourses();
    }
}

// Get user's enrolled courses
function getUserEnrollments() {
    const allEnrollments = JSON.parse(localStorage.getItem('enrollments'));
    return allEnrollments[currentUser] || [];
}

// Load enrolled courses
function loadMyCourses() {
    const allCourses = JSON.parse(localStorage.getItem('allCourses'));
    const myEnrolledIds = getUserEnrollments();
    const myCourses = allCourses.filter(course => myEnrolledIds.includes(course.id));
    
    const container = document.getElementById('myCoursesList');
    
    if (myCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">You have not enrolled in any courses yet.</p>';
    } else {
        container.innerHTML = myCourses.map(course => `
            <div class="course-card">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <p><strong>Instructor:</strong> ${course.instructor}</p>
                <button class="enrolled">Enrolled ✓</button>
            </div>
        `).join('');
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
        container.innerHTML = availableCourses.map(course => `
            <div class="course-card">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <p><strong>Instructor:</strong> ${course.instructor}</p>
                <button onclick="enrollCourse(${course.id})">Enroll Now</button>
            </div>
        `).join('');
    }
}

// Enroll in a course
function enrollCourse(courseId) {
    const allEnrollments = JSON.parse(localStorage.getItem('enrollments'));
    
    if (!allEnrollments[currentUser]) {
        allEnrollments[currentUser] = [];
    }
    
    allEnrollments[currentUser].push(courseId);
    localStorage.setItem('enrollments', JSON.stringify(allEnrollments));
    
    alert('Enrolled successfully!');
    loadNewCourses(); // Refresh the list
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Load my courses by default
loadMyCourses();