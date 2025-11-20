require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

// Dummy Cloudinary images (tech/college event themed)
const eventImages = [
    'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1652345678/conference.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1652345679/workshop.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1652345680/hackathon.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1652345681/seminar.jpg'
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-event-manager');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        console.log('Cleared existing data');

        // Create dummy admin
        const admin = await User.create({
            name: 'Dr. Sarah Johnson',
            email: 'admin@college.edu',
            password: 'admin123',
            role: 'admin',
            isVerified: true
        });
        console.log('Created admin user');

        // Create dummy events
        const events = [
            {
                title: 'Tech Innovation Summit 2025',
                description: 'Join us for an exciting summit featuring the latest innovations in technology. Industry leaders will share insights on AI, blockchain, and emerging technologies. Network with peers, attend hands-on workshops, and explore cutting-edge projects. Perfect for students interested in tech careers and entrepreneurship. Refreshments will be provided.',
                date: new Date('2025-01-15'),
                time: '9:00 AM - 5:00 PM',
                venue: 'Main Auditorium, Building A',
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
                organiser: admin._id,
                maxCapacity: 300,
                registeredStudents: []
            },
            {
                title: 'AI & Machine Learning Workshop',
                description: 'Dive deep into the world of Artificial Intelligence and Machine Learning. This hands-on workshop covers neural networks, deep learning frameworks, and real-world applications. Bring your laptop and get ready to code! Prerequisites: Basic Python knowledge. Limited seats available. Certificate of completion provided.',
                date: new Date('2025-01-20'),
                time: '10:00 AM - 4:00 PM',
                venue: 'Computer Lab 203',
                image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
                organiser: admin._id,
                maxCapacity: 50,
                registeredStudents: []
            },
            {
                title: 'Annual Hackathon 2025',
                description: 'Build innovative solutions in 24 hours! Form teams, solve real-world problems, and compete for amazing prizes worth $10,000. Mentors from top tech companies will guide you. Categories include Web Development, Mobile Apps, AI/ML, and IoT. Food, energy drinks, and swag bags provided throughout the event.',
                date: new Date('2025-02-01'),
                time: '8:00 AM (Day 1) - 8:00 AM (Day 2)',
                venue: 'Innovation Hub, Campus Center',
                image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
                organiser: admin._id,
                maxCapacity: 200,
                registeredStudents: []
            },
            {
                title: 'Career Fair: Meet Top Employers',
                description: 'Connect with recruiters from Fortune 500 companies and exciting startups. Bring your resumes and dress professionally. Companies include Google, Microsoft, Amazon, and 50+ others. Attend resume review sessions, mock interviews, and networking mixers. On-spot interviews possible. Great opportunity for internships and full-time positions.',
                date: new Date('2025-02-10'),
                time: '11:00 AM - 6:00 PM',
                venue: 'Sports Complex & Gymnasium',
                image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
                organiser: admin._id,
                maxCapacity: 500,
                registeredStudents: []
            },
            {
                title: 'Cultural Fest: Unity in Diversity',
                description: 'Celebrate the rich cultural diversity of our campus! Enjoy traditional performances, music, dance, food stalls from around the world, art exhibitions, and fashion shows. Open mic sessions, talent competitions with prizes, and cultural exchange activities. Free entry for all students. Invite your friends and family!',
                date: new Date('2025-02-25'),
                time: '2:00 PM - 10:00 PM',
                venue: 'Open Air Theatre & Food Court',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
                organiser: admin._id,
                maxCapacity: 1000,
                registeredStudents: []
            }
        ];

        await Event.insertMany(events);
        console.log('Created 5 dummy events');

        console.log('\n=== Database seeded successfully! ===');
        console.log('\nAdmin Login Credentials:');
        console.log('Email: admin@college.edu');
        console.log('Password: admin123');
        console.log('\nNote: Use these Cloudinary URLs or replace with your own images');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();