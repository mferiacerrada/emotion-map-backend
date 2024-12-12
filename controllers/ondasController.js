const calcularOndaTemporal = require('../utils/ondasTemporales');

// Controlador para devolver la onda temporal
const getOndaTemporal = async (req, res) => {
    try {
      const { intervalo, resolucion } = req.query;
  
      console.log('Parámetros recibidos:', { intervalo, resolucion });
  
      if (!intervalo || !resolucion) {
        return res.status(400).json({ error: 'Parámetros "intervalo" y "resolución" son requeridos.' });
      }
  
      const onda = await calcularOndaTemporal(intervalo, resolucion);
  
      console.log('Onda generada:', onda);
  
      res.json({ onda });
    } catch (error) {
      console.error('Error calculando la onda temporal:', error);
      res.status(500).json({ error: 'Error calculando la onda temporal.' });
    }
  };
  

module.exports = { getOndaTemporal };
