import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
    id: string;
    email: string;
    phone?: string;
    role: 'buyer' | 'seller';
    emailVerified?: boolean;
    phoneVerified?: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        // Load auth state from local storage on mount
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch (e) {
                // Invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    const updateUser = (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        setState(prev => ({
            ...prev,
            user
        }));
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
