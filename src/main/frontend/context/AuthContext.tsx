
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {AuthState, LoginCredentials, RegisterCredentials, User} from "Frontend/types";
import {AuthService} from "Frontend/generated/endpoints";
import {useNavigate} from "react-router";

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (credentials: RegisterCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload,
                error: null
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                loading: false,
                error: null
            };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                loading: false
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        isAuthenticated: false,
        user: null,
        loading: true,
        error: null
    });
    const navigate = useNavigate();

    // Check authentication status on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const user = await getCurrentUser();
            dispatch({ type: 'SET_USER', payload: user });
        } catch (error) {
            dispatch({ type: 'SET_USER', payload: null });
        }
    };

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            dispatch({ type: 'LOGIN_START' });

            const success = await AuthService.login(credentials.username, credentials.password);

            if (success) {
                // Get user info after successful login
                const user = await getCurrentUser();
                dispatch({ type: 'LOGIN_SUCCESS', payload: user! });
                navigate('/');
                return true;
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid credentials' });
                return false;
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed. Please try again.' });
            return false;
        }
    };

    const register = async (credentials: RegisterCredentials): Promise<boolean> => {
        try {
            dispatch({ type: 'LOGIN_START' });

            const success = await AuthService.register(
                credentials.username,
                credentials.password,
                credentials.email
            );

            if (success) {
                // Auto-login after successful registration
                const loginSuccess = await login({
                    username: credentials.username,
                    password: credentials.password
                });
                return loginSuccess;
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration failed. Username may already exist.' });
                return false;
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration failed. Please try again.' });
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await AuthService.logout();
            dispatch({ type: 'LOGOUT' });
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local auth state even if server logout fails
            dispatch({ type: 'LOGOUT' });
        }
    };

    const getCurrentUser = async (): Promise<User | null> => {
        try {
            const response = await AuthService.getCurrentUser();
            return response ? {
                username: response.username!,
                email: response.email!,
                role: response.role!
            } : null;

        } catch (error) {
            return null;
        }
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        getCurrentUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};