const express = require('express')
const app = express()
const cors = require('cors')
const users = [];
const exercises = {};
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const user = { username, _id: String(users.length + 1) }; // Generate a simple unique ID
  users.push(user);
  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  
  const user = users.find(u => String(u._id) === String(_id));
  if (!user) return res.status(404).json({ error: "User not found" });

  const newExercise = {
    description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  if (!exercises[_id]) exercises[_id] = [];
  exercises[_id].push(newExercise);

  res.json({ ...user, ...newExercise });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  
  const user = users.find(u => String(u._id) === String(_id));
  if (!user) return res.status(404).json({ error: "User not found" });

  let log = exercises[_id] || [];

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(ex => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, Number(limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
