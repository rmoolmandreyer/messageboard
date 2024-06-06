const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle JSON request bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));

// Load messages from JSON file
const messagesPath = path.join(__dirname, 'messages.json');
const getMessages = () => {
  try {
    const data = fs.readFileSync(messagesPath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading messages.json:', err);
    return [];
  }
};

const saveMessages = (messages) => {
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
};

// Routes
app.get('/', (req, res) => {
  const messages = getMessages();
  res.render('index', { messages });
});

app.get('/messages', (req, res) => {
  const messages = getMessages();
  res.json(messages);
});

app.post('/messages', (req, res) => {
  const { title, content } = req.body;
  const messages = getMessages();
  const newMessage = {
    id: uuidv4(),
    title,
    content
  };
  messages.push(newMessage);
  saveMessages(messages);
  res.redirect('/');
});

app.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  let messages = getMessages();
  messages = messages.filter(message => message.id !== id);
  saveMessages(messages);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
