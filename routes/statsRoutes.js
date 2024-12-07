const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');

module.exports = () => {
  // Ruta para devolver estadísticas
  router.get('/stats', (req, res) => getStats(req, res));

  return router;
};
