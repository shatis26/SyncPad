import api from "./api";

/**
 * Auth API calls and local-storage token management.
 */
const authService = {
    async signup(name, email, password) {
        const { data } = await api.post("/auth/signup", { name, email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        return data;
    },

    async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        return data;
    },

    async getMe() {
        const { data } = await api.get("/auth/me");
        return data;
    },

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    getToken() {
        return localStorage.getItem("token");
    },

    getUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem("token");
    },
};

export default authService;
