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

    logout(message = "Anda telah logout") {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        App.showView('view-login');
        UI.showToast(message);
    },

    checkSession() {
        const session = localStorage.getItem(CONFIG.STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    }
};
