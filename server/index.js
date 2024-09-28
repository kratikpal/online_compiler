const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;

// Create the HTTP server
const server = http.createServer(app);

// Create the Socket.IO server
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Set up Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Set up a simple route
app.get("/", (req, res) => {
  res.send("This is working");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
