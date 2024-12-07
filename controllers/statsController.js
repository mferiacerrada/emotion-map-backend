const calcularEstadisticas = require('../utils/calcularEstadisticas');
const { resolverUsuariosSinCityCountry } = require('../utils/clustering');
const { cities, countries } = require('../utils/loadGeoData'); // Asegúrate de cargar las ciudades y países

// Controlador para devolver estadísticas
const getStats = (req, res) => {
  try {
    // Usar el array global de usuarios
    const usuarios = global.usuarios || []; // Asegúrate de definir `global.usuarios` en `server.js`
    console.log("Usuarios recibidos para resolver:", usuarios.length);

    // Resolver usuarios sin city y country
    resolverUsuariosSinCityCountry(usuarios, cities, countries);
    console.log("Usuarios después de resolver city/country:", usuarios);

    // Calcular estadísticas
    const stats = calcularEstadisticas(usuarios);
    console.log("Estadísticas calculadas:", stats);

    res.json(stats);
  } catch (error) {
    console.error("Error calculando estadísticas:", error);
    res.status(500).json({ error: "Error calculando estadísticas." });
  }
};

module.exports = { getStats };
