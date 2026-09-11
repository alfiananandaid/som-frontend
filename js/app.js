// js/app.js

const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbx9ibnM4uNOkgK7aXQHyzRiX9moPIVYTZXBXNqmXQVfLVEtDUdqqYftjxzkbbrdovnxeg/exec', // GANTI URL INI
    STORAGE_KEY: 'som_session'
};

const UI = {
    showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.remove("hidden");
        toast.style.background = type === "error" ? "var(--danger)" : "rgba(0,0,0,0.8)";
        setTimeout(() => toast.classList.add("hidden"), 3000);
    },
    setLoading(btnId, isLoading) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        if (isLoading) {
            btn.dataset.text = btn.textContent;
            btn.textContent = "Loading...";
            btn.disabled = true;
        } else {
            btn.textContent = btn.dataset.text;
            btn.disabled = false;
        }
    }
};

const API = {
    async post(action, payload = {}) {
        const sessionStr = localStorage.getItem(CONFIG.STORAGE_KEY);
        const session = sessionStr ? JSON.parse(sessionStr) : {};
        try {
            const response = await fetch(CONFIG.API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action, token: session.session_token || null, payload }),
                redirect: 'follow'
            });
            const result = await response.json();
            if (!result.success && result.error_code === 'ERR-AUTH-EXPIRED') {
                Auth.logout("Session expired");
                return null;
            }
            return result;
        } catch (error) {
            UI.showToast("Gagal terhubung ke server", "error");
            return { success: false, message: "Network error" };
        }
    }
};

const Auth = {
    async login(username, password) {
        UI.setLoading("btn-login", true);
        const res = await API.post('login', { username, password });
        UI.setLoading("btn-login", false);
        
        if (res && res.success) {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(res.data));
            App.initSession();
        } else if (res) {
            UI.showToast(res.message, "error");
        }
    },
    logout(msg = "Logout berhasil") {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        App.showView('view-login');
        UI.showToast(msg);
    }
};

const Scanner = {
    html5Qrcode: null,
    
    init() {
        this.html5Qrcode = new Html5Qrcode("reader");
        
        document.getElementById("btn-start-scan").addEventListener("click", () => this.start());
        document.getElementById("btn-stop-scan").addEventListener("click", () => this.stop());
        document.getElementById("btn-manual-search").addEventListener("click", () => {
            const code = document.getElementById("manual-barcode").value;
            if(code) this.processBarcode(code);
        });
        document.getElementById("btn-save-so").addEventListener("click", () => this.saveSO());
    },

    start() {
        document.getElementById("scan-result").classList.add("hidden");
        document.getElementById("btn-start-scan").classList.add("hidden");
        document.getElementById("btn-stop-scan").classList.remove("hidden");

        const config = { fps: 10, qrbox: { width: 250, height: 100 }, aspectRatio: 1.0 };
        this.html5Qrcode.start(
            { facingMode: "environment" }, 
            config,
            (decodedText) => {
                this.stop();
                this.processBarcode(decodedText);
            },
            (errorMessage) => { /* Abaikan error frame scanning */ }
        ).catch(err => {
            UI.showToast("Gagal akses kamera", "error");
            this.stop();
        });
    },

    stop() {
        if (this.html5Qrcode && this.html5Qrcode.isScanning) {
            this.html5Qrcode.stop().then(() => {
                document.getElementById("btn-start-scan").classList.remove("hidden");
                document.getElementById("btn-stop-scan").classList.add("hidden");
            });
        } else {
            document.getElementById("btn-start-scan").classList.remove("hidden");
            document.getElementById("btn-stop-scan").classList.add("hidden");
        }
    },

    processBarcode(barcode) {
        UI.showToast("Mencari barcode: " + barcode);
        
        // MOCKUP API CALL (Ganti dengan API.post('findProduct') setelah backend siap)
        setTimeout(() => {
            document.getElementById("scan-result").classList.remove("hidden");
            document.getElementById("res-barcode").textContent = barcode;
            document.getElementById("res-desc").textContent = "Produk Simulasi " + barcode;
            document.getElementById("input-qty").value = "";
            document.getElementById("input-qty").focus();
        }, 500);
    },

    saveSO() {
        const qty = document.getElementById("input-qty").value;
        if(!qty) return UI.showToast("QTY harus diisi!", "error");
        
        UI.showToast("Data SO Disimpan!");
        document.getElementById("scan-result").classList.add("hidden");
        document.getElementById("manual-barcode").value = "";
        
        // Otomatis nyalakan scanner lagi untuk next item
        this.start();
    }
};

const App = {
    init() {
        this.bindEvents();
        Scanner.init();
        if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
        this.initSession();
    },

    bindEvents() {
        document.getElementById("toggle-password").addEventListener("click", (e) => {
            const inp = document.getElementById("password");
            inp.type = inp.type === "password" ? "text" : "password";
            e.target.textContent = inp.type === "password" ? "👁️" : "🙈";
        });

        document.getElementById("login-form").addEventListener("submit", (e) => {
            e.preventDefault();
            Auth.login(document.getElementById("username").value, document.getElementById("password").value);
        });

        document.getElementById("btn-logout").addEventListener("click", () => Auth.logout());

        document.querySelectorAll(".nav-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                
                document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
                document.getElementById(e.currentTarget.dataset.target).classList.remove("hidden");
                document.getElementById("header-title").textContent = e.currentTarget.querySelector(".nav-label").textContent;
                
                // Stop scanner if leaving SO tab
                if(e.currentTarget.dataset.target !== 'tab-so') Scanner.stop();
            });
        });
    },

    initSession() {
        const user = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (user) {
            const data = JSON.parse(user);
            document.getElementById("user-name").textContent = data.nama_staff;
            document.getElementById("user-role").textContent = `@${data.username} | ${data.role}`;
            this.showView('view-main');
        } else {
            this.showView('view-login');
        }
    },

    showView(viewId) {
        document.querySelectorAll(".view").forEach(el => el.classList.remove("active"));
        document.getElementById(viewId).classList.add("active");
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());
