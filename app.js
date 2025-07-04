const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ejs=require("ejs");
require('dotenv').config();

const io = new Server(server);

// Connect MongoDB with current page
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middlewares in use
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'faruq111',
  resave: false,
  saveUninitialized: false
}));

// main route
app.get('/', (req, res) => {
  res.redirect('/login');
});

// login route to get login page
app.get('/login', (req, res) => {
  res.render('login');
});

// login route to send info to DB
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    return res.redirect('/chat');
  }
  res.send('Invalid login');
});

// Register page to get page
app.get('/register', (req, res) => {
  res.render('register');
});

// send data to backend
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hash });
  await newUser.save();
  res.redirect('/login');
});

// to get chat loaded
app.get('/chat', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('chat', { user: req.session.user });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// port=3000;
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
