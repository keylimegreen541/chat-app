// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" folder
app.use(express.static("public"));

// Store messages and nicknames in memory
let messages = [];
let nicknames = {}; // { "Alice": "CoolPenguin" }

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send existing chat history and nicknames
  socket.emit("chat history", messages);
  socket.emit("nicknames update", nicknames);

  // Handle new messages
  socket.on("chat message", (data) => {
    messages.push(data);
    io.emit("chat message", data);
  });

  // Handle self username changes
  socket.on("username changed", ({ oldName, newName }) => {
    // Prevent duplicate usernames
    if (
      Object.values(nicknames).includes(newName) ||
      Object.keys(nicknames).includes(newName)
    ) {
      socket.emit("error", "That username is already taken.");
      return;
    }

    // Update nickname mapping
    nicknames[oldName] = newName;

    // Rewrite all past messages for this user
    messages = messages.map((msg) =>
      msg.user === oldName ? { ...msg, user: newName } : msg
    );

    // Broadcast updates
    io.emit("nicknames update", nicknames);
    io.emit("chat history", messages); // send updated history to everyone
    console.log(`Username changed: ${oldName} → ${newName}`);
  });

  // Allow clients to re-request history
  socket.on("request history", () => {
    socket.emit("chat history", messages);
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
