const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
// Import routes here
const userRoutes = require('./modules/users/userRoutes');
const locationRoutes = require('./modules/locations/locationRoutes');
const cropRoutes = require('./modules/crops/cropRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json()); // Parses application/json body

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Entities Service is up and running ' });
});

// Route mountings
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/departamentos', locationRoutes);
app.use('/api/municipios', locationRoutes);

// Manejador centralizado de errores (Debe ser el último middleware)
app.use(errorHandler);

module.exports = app;