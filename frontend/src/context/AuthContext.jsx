import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [telegramUser, setTelegramUser] = useState(null);
    const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);

    const checkTelegramWebApp = useCallback(() => {
        const isInTelegram = !!(window.Telegram && window.Telegram.WebApp);
        setIsTelegramWebApp(isInTelegram);

        if (isInTelegram) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            const user = tg.initDataUnsafe?.user;
            if (user) {
                setTelegramUser({
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    username: user.username,
                    photoUrl: user.photo_url
                });
            }
        }
    }, []);

    const loadUser = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/auth/me');
            setUser(data.data);
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await checkTelegramWebApp();
            await loadUser();
        }

        init();
        
    }, [loadUser, checkTelegramWebApp]);

    const telegramAuthAuto = async () => {
        if (!isTelegramWebApp || !window.Telegram?.WebApp?.initData) {
            throw new Error('Мини приложение Telegram недоступно');
        }

        const { data } = await api.post('/auth/tgAuth', {
            initData: window.Telegram.WebApp.initData
        });
        
        const { user, accessToken, refreshToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        await loadUser();

        return { user };
    };

    const requestCode = async (formData) => {
        const { data } = await api.post('/auth/requestCode', formData);
        return data;
    };

    const verifyCode = async (email, code) => {
        const payload = { email, code };
        if (isTelegramWebApp && window.Telegram?.WebApp?.initData) {
            payload.initData = window.Telegram?.WebApp?.initData;
        }
        const { data } = await api.post('/auth/verifyCode', payload);
        const { user, accessToken, refreshToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);

        return { user };
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout request failed', error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            if (isTelegramWebApp && window.Telegram?.WebApp) {
                window.Telegram.WebApp.close();
            } else {
                window.location.href = "/login";
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, telegramUser, isTelegramWebApp, telegramAuthAuto, requestCode, verifyCode, logout, loadUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}