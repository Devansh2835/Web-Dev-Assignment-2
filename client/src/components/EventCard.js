import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import './EventCard.css';

const EventCard = ({ event, index }) => {
    return (
        <motion.div
            className="event-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
        >
            <Link to={`/events/${event._id}`} className="event-card-link">
                <div className="event-card-image">
                    <img src={event.image} alt={event.title} />
                    <div className="event-card-overlay">
                        <span className="event-card-date">
                            {format(new Date(event.date), 'MMM dd, yyyy')}
                        </span>
                    </div>
                </div>
                <div className="event-card-content">
                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-description">
                        {event.description.length > 100 
                            ? `${event.description.substring(0, 100)}...` 
                            : event.description}
                    </p>
                    <div className="event-card-info">
                        <div className="event-info-item">
                            <span className="info-icon">🕐</span>
                            <span className="info-text">{event.time}</span>
                        </div>
                        <div className="event-info-item">
                            <span className="info-icon">📍</span>
                            <span className="info-text">{event.venue}</span>
                        </div>
                    </div>
                    <div className="event-card-footer">
                        <div className="organiser-info">
                            <span className="organiser-label">Organiser:</span>
                            <span className="organiser-name">{event.organiser?.name || 'Unknown'}</span>
                        </div>
                        <div className="capacity-info">
                            <span className="capacity-text">
                                {event.registeredStudents?.length || 0}/{event.maxCapacity}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default EventCard;