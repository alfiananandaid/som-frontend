const API = {
    async post(action, payload = {}) {
        const session = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
        const body = {
            action: action,
            token: session.session_token || null,
            payload: payload
        };

        try {
            const response = await fetch(CONFIG.API_BASE_URL, {
                method: 'POST',
                // Mode 'no-cors' tidak bisa membaca JSON response.
                // Google Apps Script mensyaratkan content-type text/plain untuk CORS.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(body)
            });
            
            const result = await response.json();
            
            // Handle Auto-Logout jika token expired
            if (!result.success && result.error_code === 'ERR-AUTH-EXPIRED') {
                Auth.logout(result.message);
                return null;
            }
            
            return result;
        } catch (error) {
            console.error("API Error:", error);
            UI.showToast("Gagal terhubung ke server. Periksa koneksi internet.", "error");
            return { success: false, message: "Koneksi gagal" };
        }
    }
};
