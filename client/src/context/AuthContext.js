"use client";

import { createContext, useContext, useEffect, useState } from "react";
import authService from "@/services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authService.getMe()
            .then((data) => {
                setUser(data.message.user);
            })
            .catch((error) => {
                console.log("[AuthProvider] No user logged in:", error);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (data) => {
        const loginResponse = await authService.login(data);
        const res = await authService.getMe();
        setUser(res.message.user);
    };

    const logout = async () => {
        console.log("[AuthProvider] Logout called");
        await authService.logout();
        setUser(null);
    };

    const register = async (data) => {
        const registerResponse = await authService.register(data);
        const res = await authService.getMe();
        setUser(res.message.user);
    }

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};