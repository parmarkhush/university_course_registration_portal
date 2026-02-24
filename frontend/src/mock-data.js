const mockData = {
    users: [
        {
            id: 1,
            name: 'Aarav Mehta',
            rollNumber: 'CS2024001',
            email: 'student1@university.edu',
            password: 'password123',
            department: 'Computer Science',
            semester: 4
        },
        {
            id: 2,
            name: 'Ishita Verma',
            rollNumber: 'CS2024002',
            email: 'student2@university.edu',
            password: 'password123',
            department: 'Computer Science',
            semester: 4
        },
        {
            id: 3,
            name: 'Rohan Kulkarni',
            rollNumber: 'CS2024003',
            email: 'student3@university.edu',
            password: 'password123',
            department: 'Computer Science',
            semester: 6
        }
    ],
    courses: [
        {
            id: 101,
            code: 'CS301',
            name: 'Data Structures',
            instructor: 'Dr. Smith',
            credits: 4,
            totalSeats: 30,
            enrolledCount: 0
        },
        {
            id: 102,
            code: 'CS305',
            name: 'Database Systems',
            instructor: 'Dr. Williams',
            credits: 4,
            totalSeats: 25,
            enrolledCount: 0
        },
        {
            id: 103,
            code: 'CS320',
            name: 'Web Development',
            instructor: 'Prof. Johnson',
            credits: 3,
            totalSeats: 35,
            enrolledCount: 0
        },
        {
            id: 104,
            code: 'CS340',
            name: 'Machine Learning',
            instructor: 'Prof. Brown',
            credits: 4,
            totalSeats: 20,
            enrolledCount: 0
        },
        {
            id: 105,
            code: 'CS350',
            name: 'Computer Networks',
            instructor: 'Dr. Davis',
            credits: 3,
            totalSeats: 40,
            enrolledCount: 0
        }
    ],
    enrollments: [
        {
            id: 1,
            userId: 1,
            courseId: 101,
            enrolledOn: '2026-01-10'
        },
        {
            id: 2,
            userId: 1,
            courseId: 103,
            enrolledOn: '2026-01-10'
        },
        {
            id: 3,
            userId: 2,
            courseId: 105,
            enrolledOn: '2026-01-12'
        }
    ],
    attendance: {
        1: {
            101: 92,
            103: 88
        },
        2: {
            105: 81
        },
        3: {}
    }
};

const portalDataService = {
    storageKey: 'portalDB',

    cloneData(value) {
        if (typeof structuredClone === 'function') {
            return structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    },

    buildInitialState() {
        const state = this.cloneData(mockData);
        this.syncEnrolledCounts(state);
        return state;
    },

    syncEnrolledCounts(state) {
        const countByCourse = {};
        state.enrollments.forEach(enrollment => {
            countByCourse[enrollment.courseId] = (countByCourse[enrollment.courseId] || 0) + 1;
        });

        state.courses = state.courses.map(course => ({
            ...course,
            enrolledCount: countByCourse[course.id] || 0
        }));
    },

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.buildInitialState()));
            return;
        }

        const state = this.read();
        if (!state.users || !state.courses || !state.enrollments || !state.attendance) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.buildInitialState()));
            return;
        }

        this.syncEnrolledCounts(state);
        this.write(state);
    },

    read() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    },

    write(state) {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
    },

    authenticate(rollNumber, email, password) {
        const state = this.read();
        if (!state) {
            return null;
        }

        const normalizedRoll = rollNumber.trim().toUpperCase();
        const normalizedEmail = email.trim().toLowerCase();

        return state.users.find(user => (
            user.rollNumber.toUpperCase() === normalizedRoll &&
            user.email.toLowerCase() === normalizedEmail &&
            user.password === password
        )) || null;
    }
};
