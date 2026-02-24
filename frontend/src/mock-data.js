// Mock Data for University Portal
// This structure is backend-ready for easy API integration later
//this is mock data

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
            duration: '12 weeks'
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
            duration: '10 weeks'
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
            duration: '12 weeks'
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
            duration: '14 weeks'
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
            duration: '10 weeks'
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
            duration: '12 weeks'
        }
    ],

    // Sample users (for testing - will be replaced by backend)
    users: [
        {
            id: 1,
            username: 'student1',
            email: 'student1@university.edu',
            mobile: '1234567890',
            password: 'password123',
            rollNumber: 'CS2024001'
        },
        {
            id: 2,
            username: 'student2',
            email: 'student2@university.edu',
            mobile: '9876543210',
            password: 'password123',
            rollNumber: 'CS2024002'
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