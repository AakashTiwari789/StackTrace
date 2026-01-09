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
                // console.log("[AuthProvider] Fetched logged in user:", data.message.user);
                setUser(data.message.user);
            })
            .catch((error) => {
                // console.log("[AuthProvider] No user logged in:", error);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (data) => {
        await authService.login(data);
        const res = await authService.getMe();
        // console.log(res.message.user);
        setUser(res.message.user);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const register = async (data) => {
        await authService.register(data);
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