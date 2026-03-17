const THEME_STORAGE_KEY = 'portalTheme';

async function apiRequest(url, options = {}) {
    let response;
    try {
        response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
    } catch (error) {
        throw new Error('Cannot reach the server. Make sure `npm start` is running and open the portal from http://localhost:3000.');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Request failed.');
    }

    return data;
}

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

// Switch to Register
function showRegister() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("registerBox").classList.remove("hidden");
    document.getElementById("registerError").textContent = "";
}

// Switch to Login
function showLogin() {
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
    document.getElementById("loginError").textContent = "";
}

// REGISTER - saves user to MySQL through backend API
document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value;
    const mobile = document.getElementById("regMobile").value;
    const password = document.getElementById("regPassword").value;
    const error = document.getElementById("registerError");

    error.textContent = "";

    // Mobile validation (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
        error.textContent = "Mobile number must be exactly 10 digits!";
        return;
    }

    // Email validation
    if (!email.includes("@")) {
        error.textContent = "Enter a valid email ID!";
        return;
    }

    try {
        await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, mobile, password })
        });

        alert("Account Created Successfully!");
        document.getElementById("registerForm").reset();
        showLogin();
    } catch (requestError) {
        error.textContent = requestError.message;
    }
});

// LOGIN - validates user from MySQL through backend API
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const error = document.getElementById("loginError");

    error.textContent = "";

    try {
        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        localStorage.setItem('currentUser', data.user.username);
        window.location.href = "dashboard.html";
    } catch (requestError) {
        error.textContent = requestError.message;
    }
});

initializeTheme();
document.querySelectorAll('.theme-option').forEach(button => {
    button.addEventListener('click', () => setTheme(button.dataset.themeChoice));
});
