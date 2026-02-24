// Mock Data for University Portal
// This structure is backend-ready for easy API integration later

const mockData = {
    // Sample courses data
    courses: [
        {
            id: 1,
            name: 'Data Structures',
            description: 'Learn fundamental data structures and algorithms',
            instructor: 'Dr. Smith',
            totalSeats: 30,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 4,
            duration: '12 weeks',
            prerequisites: [],
            timeSlot: 'Mon-Wed 09:00-10:30'
        },
        {
            id: 2,
            name: 'Web Development',
            description: 'Build modern web applications with HTML, CSS, and JavaScript',
            instructor: 'Prof. Johnson',
            totalSeats: 40,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 3,
            duration: '10 weeks',
            prerequisites: [],
            timeSlot: 'Tue-Thu 11:00-12:30'
        },
        {
            id: 3,
            name: 'Database Systems',
            description: 'Understanding relational databases and SQL',
            instructor: 'Dr. Williams',
            totalSeats: 25,
            enrolledCount: 0,
            department: 'Information Technology',
            credits: 4,
            duration: '12 weeks',
            prerequisites: [1],
            timeSlot: 'Mon-Wed 11:00-12:30'
        },
        {
            id: 4,
            name: 'Machine Learning',
            description: 'Introduction to ML algorithms and applications',
            instructor: 'Prof. Brown',
            totalSeats: 20,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 4,
            duration: '14 weeks',
            prerequisites: [1, 3],
            timeSlot: 'Tue-Thu 09:00-10:30'
        },
        {
            id: 5,
            name: 'Computer Networks',
            description: 'Network protocols and architecture',
            instructor: 'Dr. Davis',
            totalSeats: 35,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 3,
            duration: '10 weeks',
            prerequisites: [1],
            timeSlot: 'Mon-Wed 14:00-15:30'
        },
        {
            id: 6,
            name: 'Mobile App Development',
            description: 'Create Android and iOS applications',
            instructor: 'Prof. Miller',
            totalSeats: 30,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 4,
            duration: '12 weeks',
            prerequisites: [2],
            timeSlot: 'Tue-Thu 14:00-15:30'
        }
    ],

    // Sample users (for testing - will be replaced by backend)
    users: [
        {
            id: 1,
            username: 'student1',
            name: 'Aarav Mehta',
            email: 'student1@university.edu',
            mobile: '1234567890',
            password: 'password123',
            rollNumber: 'CS2024001',
            cpi: 9.35,
            preferredCourse: 'Machine Learning',
            completedCourseIds: [1, 2, 3],
            maxCredits: 21,
            baseCredits: 9,
            hasHold: false
        },
        {
            id: 2,
            username: 'student2',
            name: 'Ishita Verma',
            email: 'student2@university.edu',
            mobile: '9876543210',
            password: 'password123',
            rollNumber: 'CS2024002',
            cpi: 8.91,
            preferredCourse: 'Data Structures',
            completedCourseIds: [1],
            maxCredits: 18,
            baseCredits: 12,
            hasHold: false
        },
        {
            id: 3,
            username: 'student3',
            name: 'Rohan Kulkarni',
            email: 'student3@university.edu',
            mobile: '1112223333',
            password: 'password123',
            rollNumber: 'CS2024003',
            cpi: 9.35,
            preferredCourse: 'Machine Learning',
            completedCourseIds: [1, 3],
            maxCredits: 21,
            baseCredits: 15,
            hasHold: false
        },
        {
            id: 4,
            username: 'student4',
            name: 'Neha Sharma',
            email: 'student4@university.edu',
            mobile: '2223334444',
            password: 'password123',
            rollNumber: 'CS2024004',
            cpi: 8.72,
            preferredCourse: 'Web Development',
            completedCourseIds: [1, 2],
            maxCredits: 18,
            baseCredits: 15,
            hasHold: true
        },
        {
            id: 5,
            username: 'student5',
            name: 'Kabir Nair',
            email: 'student5@university.edu',
            mobile: '3334445555',
            password: 'password123',
            rollNumber: 'CS2024005',
            cpi: 9.02,
            preferredCourse: 'Database Systems',
            completedCourseIds: [1, 2, 3],
            maxCredits: 24,
            baseCredits: 6,
            hasHold: false
        },
        {
            id: 6,
            username: 'student6',
            name: 'Priya Das',
            email: 'student6@university.edu',
            mobile: '4445556666',
            password: 'password123',
            rollNumber: 'CS2024006',
            cpi: 8.72,
            preferredCourse: 'Computer Networks',
            completedCourseIds: [1],
            maxCredits: 20,
            baseCredits: 10,
            hasHold: false
        }
    ],

    // Enrollment structure (backend-ready)
    enrollments: [
        // {
        //     id: 1,
        //     userId: 1,
        //     courseId: 1,
        //     rollNumber: 'CS2024001',
        //     email: 'student1@university.edu',
        //     enrolledDate: '2024-01-15',
        //     status: 'active'
        // }
    ]
};

// Helper functions for easy backend integration later

const dataService = {
    // Get all courses
    getAllCourses() {
        return mockData.courses;
    },

    // Get course by ID
    getCourseById(courseId) {
        return mockData.courses.find(course => course.id === courseId);
    },

    // Get user enrollments
    getUserEnrollments(userId) {
        return mockData.enrollments
            .filter(e => e.userId === userId)
            .map(e => e.courseId);
    },

    // Get user by username
    getUserByUsername(username) {
        return mockData.users.find(user => user.username === username) || null;
    },

    // Get all students sorted by CPI with rank
    getRankedStudents() {
        const sorted = [...mockData.users].sort((a, b) => b.cpi - a.cpi || a.rollNumber.localeCompare(b.rollNumber));
        let rank = 0;
        let previousCpi = null;

        return sorted.map((student, index) => {
            if (student.cpi !== previousCpi) {
                rank = index + 1;
                previousCpi = student.cpi;
            }

            return {
                ...student,
                rank
            };
        });
    },

    // Enroll in course
    enrollCourse(userId, courseId, rollNumber, email) {
        const enrollment = {
            id: mockData.enrollments.length + 1,
            userId: userId,
            courseId: courseId,
            rollNumber: rollNumber,
            email: email,
            enrolledDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        mockData.enrollments.push(enrollment);
        
        // Update enrolled count
        const course = mockData.courses.find(c => c.id === courseId);
        if (course) {
            course.enrolledCount++;
        }
        
        return enrollment;
    },

    // Unenroll from course
    unenrollCourse(userId, courseId) {
        const enrollmentIndex = mockData.enrollments.findIndex(
            e => e.userId === userId && e.courseId === courseId
        );
        
        if (enrollmentIndex !== -1) {
            mockData.enrollments.splice(enrollmentIndex, 1);
            
            // Update enrolled count
            const course = mockData.courses.find(c => c.id === courseId);
            if (course && course.enrolledCount > 0) {
                course.enrolledCount--;
            }
            
            return true;
        }
        return false;
    },

    // Check if user is enrolled in course
    isEnrolled(userId, courseId) {
        return mockData.enrollments.some(
            e => e.userId === userId && e.courseId === courseId
        );
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockData, dataService };
}
