const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS middleware to allow requests from the frontend.
app.use(cors());

const io = socketIO(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity. You can restrict this for security.
    },
});

// Store notes and drawing history in memory (for simplicity).
let notes = [];
let drawings = [];

// When a client connects.
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send existing notes and drawings to the newly connected user.
    socket.emit('notes', notes);
    socket.emit('drawings', drawings);

    // Listen for new sticky notes.
    socket.on('addNote', (newNotes) => {
        notes = newNotes; // Update the notes.
        io.emit('notes', notes); // Broadcast updated notes to all users.
    });

    // Listen for drawing events from a user.
    socket.on('draw', (data) => {
        drawings.push(data); // Save the drawing history.
        socket.broadcast.emit('draw', data); // Broadcast the drawing event to other users.
    });

    // Handle user disconnecting.
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Route for the server's health check.
app.get('/', (req, res) => {
    res.send('WhiteboardPro Backend is running');
});

// Start the server on port 5000.
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
