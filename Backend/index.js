require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'FashionCollab backend is running' });
});

// We'll add auth routes here soon
// app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 4000;

app.use('/api/auth', require('./routes/user.server.route'));
app.use('/api/projects', require('./routes/project.server.route'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});