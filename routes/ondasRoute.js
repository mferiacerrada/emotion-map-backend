const express = require('express');
const router = express.Router();
const { getOndaTemporal } = require('../controllers/ondasController');

module.exports = () => {
  // Ruta para devolver la onda temporal
  router.get('/ondas', (req, res) => getOndaTemporal(req, res));

  return router;
};
