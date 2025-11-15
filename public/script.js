const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const changeNameBtn = document.getElementById("changeNameBtn");
const themeToggle = document.getElementById("themeToggle");

// Load username from localStorage or ask
let username = localStorage.getItem("chat-username");
if (!username) {
  username = prompt("Choose a username:");
  localStorage.setItem("chat-username", username);
}

// Load saved theme or default to light
let savedTheme = localStorage.getItem("chat-theme");
if (!savedTheme) {
  savedTheme = "light";
  localStorage.setItem("chat-theme", savedTheme);
}
document.body.classList.add(savedTheme);

// Theme toggle button
themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("light")) {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    localStorage.setItem("chat-theme", "dark");
  } else {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    localStorage.setItem("chat-theme", "light");
  }
});

// Load chat history from server
socket.on("chat history", (history) => {
  messages.innerHTML = "";
  history.forEach(addMessageToUI);
});

// Send new messages
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    const data = { user: username, text: input.value };
    socket.emit("chat message", data);
    input.value = "";
  }
});

// Receive new messages
socket.on("chat message", (data) => {
  addMessageToUI(data);
});

// Change username button
changeNameBtn.addEventListener("click", () => {
  const newName = prompt("Enter new username:");
  if (newName) {
    username = newName;
    localStorage.setItem("chat-username", username);
    alert("Username updated!");
  }
});

// Helper: add message to UI
function addMessageToUI(data) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message");

  // Keep style: your messages = "self", others = "other"
  wrapper.classList.add(data.user === username ? "self" : "other");

  const name = document.createElement("div");
  name.classList.add("username");
  name.textContent = data.user;

  const msg = document.createElement("div");
  msg.textContent = data.text;

  wrapper.appendChild(name);
  wrapper.appendChild(msg);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}
