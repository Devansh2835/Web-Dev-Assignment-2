import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-card">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Login to your account</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@college.edu"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                minLength="6"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </motion.button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;