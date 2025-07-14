import React, { useState } from 'react';
import {LoginCredentials} from "Frontend/types";
import {useAuth} from "Frontend/context/AuthContext";
import "./style.css"
import {useNavigate} from "react-router";

export const LoginForm: React.FC = () => {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(credentials);
    };

    const handleNavigate = (route: string) => {
        navigate(route);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="login-form">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            <p className="auth-navigation">
                Don't have an account?{' '}
                <span
                    onClick={() => handleNavigate('/register')}
                >
                    Sign Up
                </span>
            </p>
        </div>
    );
};