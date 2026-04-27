require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'FashionCollab API Docs',
  customCss: '.swagger-ui .topbar { background-color: #0f766e; }',
  swaggerOptions: {
    persistAuthorization: true // keeps your token across page refreshes
  }
}))

app.use('/api/auth', require('./routes/user.server.route'));
app.use('/api/projects', require('./routes/project.server.route'));
app.use('/api/profiles', require('./routes/profile.route'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api/docs`);
});