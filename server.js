const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

let messages = []
let nicknames = {}

io.on("connection", (socket) => {
  console.log("A user connected")
  let currentUser = null

  socket.emit("chat history", messages)
  socket.emit("nicknames update", nicknames)

  socket.on("set username", (name) => {
    currentUser = name
  })

  socket.on("chat message", (data) => {
    messages.push(data)
    io.emit("chat message", data)
  })

  socket.on("username changed", ({ oldName, newName }) => {
    if (
      Object.values(nicknames).includes(newName) ||
      Object.keys(nicknames).includes(newName)
    ) {
      socket.emit("error", "That username is already taken.")
      return
    }

    nicknames[oldName] = newName
    messages = messages.map((msg) =>
      msg.user === oldName ? { ...msg, user: newName } : msg
    )

    io.emit("nicknames update", nicknames)
    io.emit("chat history", messages)
    console.log(`Username changed: ${oldName} → ${newName}`)
  })

  socket.on("request history", () => {
    socket.emit("chat history", messages)
  })

  socket.on
