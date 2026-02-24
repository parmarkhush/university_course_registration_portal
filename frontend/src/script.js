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

// REGISTER - Just saves to localStorage (optional)
document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("regEmail").value;
    const mobile = document.getElementById("regMobile").value;
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

    alert("Account Created Successfully!");
    document.getElementById("registerForm").reset();
    showLogin();
});

// LOGIN - Accepts ANY username/password and goes to dashboard
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;

    // Save username to show on dashboard
    localStorage.setItem('currentUser', username);
    
    // Go directly to dashboard - NO validation!
    window.location.href = "dashboard.html";
});
