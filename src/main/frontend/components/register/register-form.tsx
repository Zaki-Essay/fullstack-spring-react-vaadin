import React, { useState } from 'react';
import {RegisterCredentials} from "Frontend/types";
import {useAuth} from "Frontend/context/AuthContext";
import "./style.css"
import {useNavigate} from "react-router";

export const RegisterForm: React.FC = () => {
    const [credentials, setCredentials] = useState<RegisterCredentials>({
        username: '',
        password: '',
        email: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { register, loading, error } = useAuth();
    const handleNavigate = (route: string) => {
        navigate(route);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (credentials.password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        await register(credentials);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="register-form">
            <h2>Create Account</h2>
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
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={credentials.email}
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

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
            <p className="auth-navigation">
                Already have an account?{' '}
                <span
                    onClick={() => handleNavigate('/login')}
                >
                    Sign In
                </span>
            </p>
        </div>
    );
};