const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server: SocketServer } = require("socket.io");
const runCodeRoute = require("./routes/run_code_route");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create the HTTP server
const server = http.createServer(app);

app.use("/run-code", runCodeRoute);

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
