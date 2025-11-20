import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const { verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        navigate('/register');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await verifyOTP(email, otp);
            toast.success('Email verified successfully!');
            navigate('/');
        } catch (error) {
            const message = error.response?.data?.error || 'Verification failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await resendOTP(email);
            toast.success('OTP sent successfully!');
            setOtp('');
        } catch (error) {
            toast.error('Failed to resend OTP');
        } finally {
            setResending(false);
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
                    <div className="otp-icon">📧</div>
                    <h2 className="auth-title">Verify Your Email</h2>
                    <p className="auth-subtitle">
                        We've sent a 6-digit OTP to<br />
                        <strong>{email}</strong>
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                required
                                maxLength="6"
                                pattern="[0-9]{6}"
                                className="otp-input"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading || otp.length !== 6}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </motion.button>
                    </form>

                    <div className="resend-section">
                        <p>Didn't receive the code?</p>
                        <motion.button
                            onClick={handleResend}
                            disabled={resending}
                            className="btn-link"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {resending ? 'Sending...' : 'Resend OTP'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;