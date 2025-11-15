// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" folder
app.use(express.static("public"));

// Store messages in memory (for demo purposes; use a database for persistence)
let messages = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send existing chat history to the new client
  socket.emit("chat history", messages);

  // Handle new messages
  socket.on("chat message", (data) => {
    // data = { user: "Alice", text: "Hello" }
    messages.push(data); // save to server memory
    io.emit("chat message", data); // broadcast to everyone
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
