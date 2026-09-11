const UI = {
    showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.remove("hidden");
        toast.style.background = type === "error" ? "var(--error)" : "rgba(0,0,0,0.8)";
        
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    },

    setLoading(buttonId, isLoading) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        if (isLoading) {
            btn.dataset.originalText = btn.textContent;
            btn.textContent = "Loading...";
            btn.disabled = true;
        } else {
            btn.textContent = btn.dataset.originalText;
            btn.disabled = false;
        }
    }
};

const App = {
    init() {
        this.bindEvents();
        this.registerServiceWorker();
        this.initSession();
    },

    bindEvents() {
        // Toggle Password Visibility
        document.getElementById("toggle-password").addEventListener("click", (e) => {
            const input = document.getElementById("password");
            if (input.type === "password") {
                input.type = "text";
                e.target.textContent = "🙈";
            } else {
                input.type = "password";
                e.target.textContent = "👁️";
            }
        });

        // Login Submit
        document.getElementById("login-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const user = document.getElementById("username").value;
            const pass = document.getElementById("password").value;
            Auth.login(user, pass);
        });

        // Logout
        document.getElementById("btn-logout").addEventListener("click", () => Auth.logout());

        // Bottom Navigation Logic
        document.querySelectorAll(".nav-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const targetId = e.currentTarget.dataset.target;
                this.switchTab(targetId, e.currentTarget);
            });
        });
    },

    initSession() {
        const user = Auth.checkSession();
        if (user) {
            // Populate Dashboard Data
            document.getElementById("user-name").textContent = user.nama_staff;
            document.getElementById("user-role").textContent = `@${user.username} | ${user.role}`;
            this.showView('view-main');
        } else {
            this.showView('view-login');
        }
    },

    showView(viewId) {
        document.querySelectorAll(".view").forEach(el => el.classList.remove("active"));
        document.getElementById(viewId).classList.add("active");
    },

    switchTab(tabId, activeBtn) {
        // Update Buttons
        document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
        activeBtn.classList.add("active");

        // Update Content Sections
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active", "hidden"));
        document.querySelectorAll(".tab-content").forEach(content => {
            if(content.id === tabId) {
                content.classList.add("active");
                // Update Header Title based on Label
                document.getElementById("header-title").textContent = activeBtn.querySelector(".nav-label").textContent;
            } else {
                content.classList.add("hidden");
            }
        });
    },

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(reg => console.log('SW Registered: ', reg.scope))
                    .catch(err => console.log('SW Registration failed: ', err));
            });
        }
    }
};

// Initialize App on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => App.init());
