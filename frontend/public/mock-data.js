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
        },
        {
            id: 7,
            name: 'Operating Systems',
            description: 'Explore processes, memory management, file systems, and scheduling',
            instructor: 'Dr. Anderson',
            totalSeats: 32,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 4,
            duration: '12 weeks',
            prerequisites: [1],
            timeSlot: 'Fri 09:00-12:00'
        },
        {
            id: 8,
            name: 'Artificial Intelligence',
            description: 'Study intelligent agents, search, reasoning, and AI applications',
            instructor: 'Prof. Taylor',
            totalSeats: 28,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 4,
            duration: '12 weeks',
            prerequisites: [1, 3],
            timeSlot: 'Mon-Wed 15:30-17:00'
        },
        {
            id: 9,
            name: 'Cyber Security Fundamentals',
            description: 'Learn security principles, threat modeling, and secure system design',
            instructor: 'Dr. Thomas',
            totalSeats: 30,
            enrolledCount: 0,
            department: 'Information Technology',
            credits: 3,
            duration: '10 weeks',
            prerequisites: [5],
            timeSlot: 'Tue-Thu 16:00-17:30'
        },
        {
            id: 10,
            name: 'Cloud Computing',
            description: 'Understand cloud infrastructure, deployment models, and scalable services',
            instructor: 'Prof. Garcia',
            totalSeats: 36,
            enrolledCount: 0,
            department: 'Information Technology',
            credits: 3,
            duration: '10 weeks',
            prerequisites: [2, 3],
            timeSlot: 'Wed-Fri 10:30-12:00'
        },
        {
            id: 11,
            name: 'Human Computer Interaction',
            description: 'Design user-centered interfaces with usability and accessibility principles',
            instructor: 'Dr. Martinez',
            totalSeats: 26,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 3,
            duration: '8 weeks',
            prerequisites: [],
            timeSlot: 'Thu 13:00-16:00'
        },
        {
            id: 12,
            name: 'Software Testing and Quality Assurance',
            description: 'Practice test design, automation, debugging, and quality processes',
            instructor: 'Prof. Lee',
            totalSeats: 34,
            enrolledCount: 0,
            department: 'Computer Science',
            credits: 3,
            duration: '10 weeks',
            prerequisites: [2],
            timeSlot: 'Fri 14:00-17:00'
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
        },
        {
            id: 7,
            username: 'student7',
            name: 'Ananya Iyer',
            email: 'student7@university.edu',
            mobile: '5556667777',
            password: 'password123',
            rollNumber: 'CS2024007',
            cpi: 9.48,
            preferredCourse: 'Artificial Intelligence',
            completedCourseIds: [1, 2, 3, 5],
            maxCredits: 24,
            baseCredits: 9,
            hasHold: false
        },
        {
            id: 8,
            username: 'student8',
            name: 'Arjun Patel',
            email: 'student8@university.edu',
            mobile: '6667778888',
            password: 'password123',
            rollNumber: 'CS2024008',
            cpi: 8.65,
            preferredCourse: 'Operating Systems',
            completedCourseIds: [1, 2],
            maxCredits: 18,
            baseCredits: 12,
            hasHold: false
        },
        {
            id: 9,
            username: 'student9',
            name: 'Sneha Reddy',
            email: 'student9@university.edu',
            mobile: '7778889999',
            password: 'password123',
            rollNumber: 'CS2024009',
            cpi: 9.11,
            preferredCourse: 'Cloud Computing',
            completedCourseIds: [1, 2, 3],
            maxCredits: 21,
            baseCredits: 9,
            hasHold: false
        },
        {
            id: 10,
            username: 'student10',
            name: 'Vikram Singh',
            email: 'student10@university.edu',
            mobile: '8889990001',
            password: 'password123',
            rollNumber: 'CS2024010',
            cpi: 8.38,
            preferredCourse: 'Cyber Security Fundamentals',
            completedCourseIds: [1, 5],
            maxCredits: 18,
            baseCredits: 12,
            hasHold: false
        },
        {
            id: 11,
            username: 'student11',
            name: 'Meera Joshi',
            email: 'student11@university.edu',
            mobile: '9990001112',
            password: 'password123',
            rollNumber: 'CS2024011',
            cpi: 9.26,
            preferredCourse: 'Human Computer Interaction',
            completedCourseIds: [1, 2, 11],
            maxCredits: 21,
            baseCredits: 6,
            hasHold: false
        },
        {
            id: 12,
            username: 'student12',
            name: 'Rahul Menon',
            email: 'student12@university.edu',
            mobile: '1011121314',
            password: 'password123',
            rollNumber: 'CS2024012',
            cpi: 8.84,
            preferredCourse: 'Software Testing and Quality Assurance',
            completedCourseIds: [1, 2, 6],
            maxCredits: 20,
            baseCredits: 9,
            hasHold: true
        },
        {
            id: 13,
            username: 'student13',
            name: 'Diya Kapoor',
            email: 'student13@university.edu',
            mobile: '1213141516',
            password: 'password123',
            rollNumber: 'CS2024013',
            cpi: 9.57,
            preferredCourse: 'Machine Learning',
            completedCourseIds: [1, 2, 3, 4, 8],
            maxCredits: 24,
            baseCredits: 6,
            hasHold: false
        },
        {
            id: 14,
            username: 'student14',
            name: 'Karan Malhotra',
            email: 'student14@university.edu',
            mobile: '1314151617',
            password: 'password123',
            rollNumber: 'CS2024014',
            cpi: 8.49,
            preferredCourse: 'Mobile App Development',
            completedCourseIds: [1, 2],
            maxCredits: 18,
            baseCredits: 10,
            hasHold: false
        },
        {
            id: 15,
            username: 'student15',
            name: 'Pooja Chatterjee',
            email: 'student15@university.edu',
            mobile: '1415161718',
            password: 'password123',
            rollNumber: 'CS2024015',
            cpi: 9.03,
            preferredCourse: 'Database Systems',
            completedCourseIds: [1, 2, 3, 7],
            maxCredits: 22,
            baseCredits: 8,
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
