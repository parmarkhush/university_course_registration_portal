const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const DEMO_SESSION_MS = 10 * 60 * 1000;

portalDataService.init();

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const rollNumber = document.getElementById('loginRoll').value;
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    let user = portalDataService.authenticate(rollNumber, email, password);
    const state = portalDataService.read();
    const normalizedRoll = rollNumber.trim().toUpperCase();

    if (!user) {
        user = state.users.find(item => item.rollNumber.toUpperCase() === normalizedRoll) || null;
    }

    if (!user) {
        loginError.textContent = 'Invalid roll number.';
        return;
    }

    loginError.textContent = 'Demo mode: email/password ignored, session active for 10 minutes.';
    localStorage.setItem('currentUserId', String(user.id));
    localStorage.setItem('sessionExpiresAt', String(Date.now() + DEMO_SESSION_MS));
    window.location.href = 'dashboard.html';
});
