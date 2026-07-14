import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem('adminToken');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setToken(storedToken);
                } else {
                    localStorage.removeItem('adminToken');
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Ошибка проверки токена:', error);
                localStorage.removeItem('adminToken');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = async (username, password) => {
        try {
            const url = `${API_BASE_URL}/api/auth/login`;
            console.log('Login request to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            console.log('Login response status:', response.status, response.statusText);

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Ответ сервера не JSON:', text);
                if (text.includes('<!DOCTYPE html>') || text.includes('Cannot POST')) {
                    return { 
                        success: false, 
                        error: 'Сервер не отвечает. Убедитесь, что сервер запущен на порту 3000.' 
                    };
                }
                return { success: false, error: 'Ошибка сервера (не JSON)' };
            }

            if (!response.ok) {
                const errorMessage = data.message || data.error || `Ошибка входа (${response.status})`;
                return { success: false, error: errorMessage };
            }

            if (!data.token || !data.user) {
                return { success: false, error: 'Неверный формат ответа сервера' };
            }

            localStorage.setItem('adminToken', data.token);
            setToken(data.token);
            setUser(data.user);

            return { success: true };
        } catch (error) {
            console.error('Ошибка входа:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return {
                    success: false,
                    error: 'Не удалось подключиться к серверу. Проверьте, что сервер запущен.',
                };
            }
            return {
                success: false,
                error: error.message || 'Ошибка входа в систему',
            };
        }
    };


    const logout = async () => {
        try {
            if (token) {
                await fetch(`${API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
        } finally {
            localStorage.removeItem('adminToken');
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
