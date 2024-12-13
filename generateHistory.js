const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User'); // Asegúrate de que este modelo esté bien configurado

// Conecta a MongoDB
mongoose.connect('mongodb://localhost:27017/EmotionMapDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Colores disponibles para los usuarios
const coloresDisponibles = [
  "rgba(255, 0, 0, 0.8)",    // Rojo
  "rgba(0, 255, 0, 0.8)",    // Verde
  "rgba(0, 0, 255, 0.8)",    // Azul
  "rgba(255, 255, 0, 0.8)",  // Amarillo
  "rgba(255, 165, 0, 0.8)",  // Naranja
  "rgba(75, 0, 130, 0.8)",   // Púrpura
  "rgba(255, 20, 147, 0.8)", // Rosa
  "rgba(0, 255, 255, 0.8)"   // Cian
];

// Regiones geográficas
const regiones = [
  { latMin: 40.4, latMax: 40.5, lngMin: -3.7, lngMax: -3.6 }, // Madrid
  { latMin: 48.85, latMax: 48.9, lngMin: 2.3, lngMax: 2.4 },  // París
  { latMin: 35.6, latMax: 35.7, lngMin: 139.7, lngMax: 139.8 }, // Tokio
  { latMin: 51.5, latMax: 51.6, lngMin: -0.1, lngMax: 0.0 },  // Londres
];

// Generar coordenadas dentro de una región aleatoria
const generarCoordenadas = () => {
  const region = regiones[Math.floor(Math.random() * regiones.length)];
  const lat = Math.random() * (region.latMax - region.latMin) + region.latMin;
  const lng = Math.random() * (region.lngMax - region.lngMin) + region.lngMin;
  return { lat, lng };
};

// Generar intensidad dinámica
const generarIntensidad = (timestamp) => {
  const baseIntensidad = Math.random() * 10 + 10; // Base entre 10 y 20
  const variacionTemporal = Math.sin(timestamp.getTime() / (24 * 60 * 60 * 1000)) * 5; // Variación senoidal
  return Math.max(baseIntensidad + variacionTemporal, 0); // Asegura que sea positiva
};

// Función para generar datos falsos
const generarHistorialFalso = async (cantidadDias, puntosPorDia) => {
  const ahora = new Date();

  for (let i = 0; i < cantidadDias; i++) {
    const fecha = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000); // Restar días

    for (let j = 0; j < puntosPorDia; j++) {
      const userId = uuidv4();
      const { lat, lng } = generarCoordenadas();
      const color = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)];
      const intensidad = generarIntensidad(fecha); // Intensidad dinámica

      const user = new User({
        userId,
        lat,
        lng,
        color,
        size: intensidad * 2, // Relacionamos tamaño con intensidad
        intensidad,
        city: null,
        country: null,
        timestamp: fecha,
      });

      await user.save().catch(err => console.error('Error al guardar usuario:', err));
    }
  }

  console.log('Historial generado correctamente.');
  mongoose.disconnect();
};

// Llamar a la función para generar el historial
generarHistorialFalso(180, 500); // 180 días (6 meses) con 100 puntos por día
