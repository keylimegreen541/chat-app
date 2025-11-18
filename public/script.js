const socket = io()
const form = document.getElementById("form")
const input = document.getElementById("input")
const messages = document.getElementById("messages")
const changeNameBtn = document.getElementById("changeNameBtn")
const themeToggle = document.getElementById("themeToggle")

let username = localStorage.getItem("chat-username")
if (!username) {
  username = prompt("Choose a username:")
  localStorage.setItem("chat-username", username)
}
socket.emit("set username", username)

themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("light")) {
    document.body.classList.remove("light")
    document.body.classList.add("dark")
    localStorage.setItem("chat-theme", "dark")
  } else {
    document.body.classList.remove("dark")
    document.body.classList.add("light")
    localStorage.setItem("chat-theme", "light")
  }
})

socket.on("chat history", (history) => {
  messages.innerHTML = ""
  history.forEach(addMessageToUI)
})

form.addEventListener("submit", (e) => {
  e.preventDefault()
  if (input.value) {
    const data = { user: username, text: input.value }
    socket.emit("chat message", data)
    input.value = ""
  }
})

socket.on("chat message", (data) => {
  addMessageToUI(data)
})

changeNameBtn.addEventListener("click", () => {
  const newName = prompt("Enter new username:")
  if (newName) {
    if (
      Object.values(nicknames).includes(newName) ||
      Object.keys(nicknames).includes(newName)
    ) {
      alert("That username is already taken. Please choose another.")
      return
    }
    const oldName = username
    username = newName
    localStorage.setItem("chat-username", username)
    alert("Username updated!")
    socket.emit("username changed", { oldName, newName })
  }
})

let nicknames = {}

socket.on("nicknames update", (data) => {
  nicknames = data
  refreshMessages()
})

function addMessageToUI(data) {
  const wrapper = document.createElement("div")
  wrapper.classList.add("message")
  wrapper.classList.add(data.user === username ? "self" : "other")

  const name = document.createElement("div")
  name.classList.add("username")
  const displayName = nicknames[data.user] || data.user
  name.textContent = displayName

  const msg = document.createElement("div")
  msg.textContent = data.text

  wrapper.appendChild(name)
  wrapper.appendChild(msg)
  messages.appendChild(wrapper)
  messages.scrollTop = messages.scrollHeight
}

function refreshMessages() {
  messages.innerHTML = ""
  socket.emit("request history")
}
