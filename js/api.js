const API = {
    async post(action, payload = {}) {
        const sessionString = localStorage.getItem(CONFIG.STORAGE_KEY);
        const session = sessionString ? JSON.parse(sessionString) : {};
        
        const body = {
            action: action,
            token: session.session_token || null,
            payload: payload
        };

        try {
            const response = await fetch(CONFIG.API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(body),
                redirect: 'follow' // PENTING untuk Google Apps Script
            });
            
            const result = await response.json();
            
            if (!result.success && result.error_code === 'ERR-AUTH-EXPIRED') {
                Auth.logout(result.message);
                return null;
            }
            
            return result;
        } catch (error) {
            console.error("API Error:", error);
            UI.showToast("Gagal terhubung ke server.", "error");
            return { success: false, message: "Koneksi ke server gagal" };
        }
    }
};
