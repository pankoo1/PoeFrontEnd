import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService, LoginCredentials } from '@/services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay un token guardado
        const token = ApiService.getToken();
        if (token) {
            // Aquí podrías hacer una llamada al backend para validar el token
            // y obtener la información del usuario
            setUser({ token }); // Por ahora solo guardamos el token
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await ApiService.login(credentials);
            setUser({ token: response.access_token });
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    };

    const logout = () => {
        ApiService.logout();
        setUser(null);
    };

    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
} 