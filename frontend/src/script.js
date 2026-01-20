let users = []; // stores registered users

// Switch to Register
function showRegister() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("registerBox").classList.remove("hidden");
}

// Switch to Login
function showLogin() {
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}

// REGISTER
document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const mobile = document.getElementById("regMobile").value;
    const password = document.getElementById("regPassword").value;
    const error = document.getElementById("registerError");

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

    users.push({ username, email, mobile, password });
    alert("Account Created Successfully!");

    showLogin();
});

// LOGIN
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    const error = document.getElementById("loginError");

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        alert("Login Successful!");
        // window.location.href = "dashboard.html";
    } else {
        error.textContent = "Invalid username or password!";
    }
});
