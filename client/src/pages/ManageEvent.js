import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ManageEvent.css';

const ManageEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        image: '',
        maxCapacity: 200
    });

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await axios.get(`${API_URL}/events/${id}`);
            const event = response.data;

            setFormData({
                title: event.title,
                description: event.description,
                date: event.date.split('T')[0],
                time: event.time,
                venue: event.venue,
                image: event.image,
                maxCapacity: event.maxCapacity
            });
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Failed to load event');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.put(
                `${API_URL}/events/${id}`,
                formData,
                { withCredentials: true }
            );
            toast.success('Event updated successfully!');
            navigate(`/events/${id}`);
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to update event';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await axios.delete(`${API_URL}/events/${id}`, {
                withCredentials: true
            });
            toast.success('Event deleted successfully');
            navigate('/');
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to delete event';
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="manage-event-page">
            <div className="container">
                <motion.div
                    className="manage-event-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="page-header">
                        <h1 className="page-title">Manage Event</h1>
                        <Link to={`/events/${id}`} className="btn btn-secondary">
                            ← Back to Event
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="manage-event-form">
                        <div className="form-group">
                            <label htmlFor="title">Event Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter event description"
                                rows="6"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">Date *</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="time">Time *</label>
                                <input
                                    type="text"
                                    id="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    placeholder="e.g., 10:00 AM - 2:00 PM"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="venue">Venue *</label>
                            <input
                                type="text"
                                id="venue"
                                name="venue"
                                value={formData.venue}
                                onChange={handleChange}
                                placeholder="Enter event venue"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Image URL (Cloudinary) *</label>
                            <input
                                type="url"
                                id="image"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://res.cloudinary.com/..."
                                required
                            />
                            {formData.image && (
                                <div className="image-preview">
                                    <img src={formData.image} alt="Event preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxCapacity">Maximum Capacity *</label>
                            <input
                                type="number"
                                id="maxCapacity"
                                name="maxCapacity"
                                value={formData.maxCapacity}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </motion.button>

                            <motion.button
                                type="button"
                                onClick={handleDelete}
                                className="btn btn-danger"
                                disabled={deleting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {deleting ? 'Deleting...' : 'Delete Event'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ManageEvent;