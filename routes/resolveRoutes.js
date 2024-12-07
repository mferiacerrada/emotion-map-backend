const express = require('express');
const { resolveCoordinates } = require('../controllers/resolveController');

const router = express.Router();

router.post('/resolve-coordinates', resolveCoordinates);

module.exports = router;
