import apiFetch from "./api.js";

const authService = {
    login(data) {
        return apiFetch("auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    register(data) {
        return apiFetch("auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    logout() {
        return apiFetch("auth/logout", {
            method: "POST",
        });
    },

    getMe() {
        // console.log("Fetching current user with cookies:", document.cookie);
        return apiFetch("auth/me");
    },
};

export default authService;