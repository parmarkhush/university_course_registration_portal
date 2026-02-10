// Check if user is logged in
const currentUser = localStorage.getItem('currentUser');
let currentUserId = parseInt(localStorage.getItem('userId')) || 1; // Mock user ID

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

// Load enrolled courses (backend-ready)
function loadMyCourses() {
    const allCourses = JSON.parse(localStorage.getItem('allCourses'));
    const myEnrolledIds = getUserEnrollments();
    const myCourses = allCourses.filter(course => myEnrolledIds.includes(course.id));
    
    const container = document.getElementById('myCoursesList');
    
    if (myCourses.length === 0) {
        container.innerHTML = '<p class="empty-message">You have not enrolled in any courses yet. 📚</p>';
    } else {
        container.innerHTML = myCourses.map(course => {
            const seatsLeft = course.totalSeats - course.enrolledCount;
            return `
                <div class="course-card">
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                    <p><strong>Instructor:</strong> ${course.instructor}</p>
                    <p class="seats-info">Seats: ${course.enrolledCount}/${course.totalSeats} enrolled</p>
                    <button class="enrolled" onclick="unenrollCourse(${course.id})">Unenroll ✗</button>
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
        container.innerHTML = '<p class="empty-message">No new courses available. You have enrolled in all courses! 🎓</p>';
    } else {
        container.innerHTML = availableCourses.map(course => {
            const seatsLeft = course.totalSeats - course.enrolledCount;
            const isFull = seatsLeft === 0;
            const isLow = seatsLeft > 0 && seatsLeft <= 5;
            
            let seatClass = '';
            if (isFull) seatClass = 'full';
            else if (isLow) seatClass = 'low';
            
            return `
                <div class="course-card">
                    <h3>${course.name}</h3>
                    <p>${course.description}</p>
                    <p><strong>Instructor:</strong> ${course.instructor}</p>
                    <p class="seats-info ${seatClass}">${seatsLeft} seats left (${course.enrolledCount}/${course.totalSeats} enrolled)</p>
                    <button onclick="enrollCourse(${course.id})" ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Course Full' : 'Enroll Now'}
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
    
    // Find the course and check seats
    const course = allCourses.find(c => c.id === courseId);
    const seatsLeft = course.totalSeats - course.enrolledCount;
    
    if (seatsLeft === 0) {
        alert('Sorry, this course is full!');
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
    
    alert('Enrolled successfully! 🎉');
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
            
            alert('Unenrolled successfully! 👋');
            loadMyCourses();
            
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

// Load my courses by default
loadMyCourses();