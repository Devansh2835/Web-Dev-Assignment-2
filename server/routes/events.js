const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organiser', 'name email')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organiser', 'name email')
            .populate('registeredStudents', 'name email');

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Create event (Admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, description, date, time, venue, image, maxCapacity } = req.body;

        const event = new Event({
            title,
            description,
            date,
            time,
            venue,
            image,
            maxCapacity,
            organiser: req.session.userId
        });

        await event.save();
        await event.populate('organiser', 'name email');

        res.status(201).json({
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Update event (Admin - only if organiser)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is the organiser
        if (event.organiser.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'You can only edit events you organize' });
        }

        const { title, description, date, time, venue, image, maxCapacity } = req.body;

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.time = time || event.time;
        event.venue = venue || event.venue;
        event.image = image || event.image;
        event.maxCapacity = maxCapacity || event.maxCapacity;

        await event.save();
        await event.populate('organiser', 'name email');

        res.json({
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event (Admin - only if organiser)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is the organiser
        if (event.organiser.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'You can only delete events you organize' });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Check if user is organiser
router.get('/:id/is-organiser', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const isOrganiser = event.organiser.toString() === req.session.userId && req.session.role === 'admin';

        res.json({ isOrganiser });
    } catch (error) {
        console.error('Error checking organiser:', error);
        res.status(500).json({ error: 'Failed to check organiser status' });
    }
});

module.exports = router;