import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const parsed = JSON.parse(userInfo);
                    if (parsed && typeof parsed === 'object') {
                        setUser(parsed);
                    } else {
                        localStorage.removeItem('userInfo');
                    }
                }
            } catch (error) {
                console.error('Failed to parse user info:', error);
                localStorage.removeItem('userInfo');
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
