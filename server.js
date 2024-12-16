const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const resolveRoutes = require('./routes/resolveRoutes'); // Rutas de resolución
const statsRoutes = require('./routes/statsRoutes'); // Rutas de estadísticas
const { resolverUsuariosSinCityCountry } = require('./utils/clustering'); // Lógica de clustering
const { cities, countries } = require('./utils/loadGeoData'); // Cargar datos geográficos
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const ondasRoute = require('./routes/ondasRoute');

let frontEndUrl;


// Detección del entorno
const environment = process.env.NODE_ENV || 'development';
console.log(`Running in ${environment} mode`);


const fs = require('fs');
console.log(fs.readdirSync(path.join(__dirname, 'utils')));


// Configuración específica para cada entorno
if (environment === 'development') {
  // Solo en desarrollo
   // Conecta a MongoDB
   frontEndUrl = 'http://localhost:3000';
   mongoose.connect('mongodb://localhost:27017/EmotionMapDb', {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
     .then(() => console.log('Conectado a MongoDB'))
     .catch(err => console.error('Error al conectar a MongoDB:', err));

}else{
    frontEndUrl = 'https://www.emotionmap.es';
  // Conecta a MongoDB Cloud
    mongoose.connect('mongodb+srv://MapEmotionUser:9Hz3drgCW2QIr43O@emotionmapcluster.lbswe.mongodb.net/?retryWrites=true&w=majority&appName=EmotionMapCluster', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));
}



const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://www.emotionmap.es',
  'https://emotionmap.es', // Tu URL de frontend (por ejemplo, en producción)
  'http://localhost:3000', // URL local para desarrollo
  'http://127.0.0.1:3000',
  "https://emotion-map-five.vercel.app" // Por si se accede con la IP local
];


// Configuración de CORS para API REST
app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes desde orígenes permitidos o herramientas sin origen
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Configuración de headers adicionales (incluye Access-Control-Allow-Origin)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', frontEndUrl);
  console.log('Headers configurados:', res.getHeaders());
  next();
});

// Configuración de CORS para Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

// Verificar configuración en consola
console.log('CORS configurado para:', allowedOrigins);

// Array de usuarios
global.usuarios = [];

app.use(express.json()); // Middleware para procesar JSON
app.use('/api', statsRoutes());
app.use('/api', ondasRoute());

// Colores disponibles para usuarios
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

// Generar usuarios falsos iniciales y guardarlos en MongoDB
function generarUsuariosFalsosConcentrados(cantidad = 75) {
  const regiones = [
    { minLat: 40.4, maxLat: 40.5, minLng: -3.7, maxLng: -3.6 }, // Madrid
    { minLat: 48.85, maxLat: 48.9, minLng: 2.3, maxLng: 2.4 }, // París
    { minLat: 35.6, maxLat: 35.7, minLng: 139.7, maxLng: 139.8 }, // Tokio
    { minLat: 51.5, maxLat: 51.6, minLng: -0.1, maxLng: 0.0 }, // Londres
    { minLat: 40.7, maxLat: 40.8, minLng: -74.0, maxLng: -73.9 }, // Nueva York
    { minLat: 34.0, maxLat: 34.1, minLng: -118.3, maxLng: -118.2 }, // Los Ángeles
    { minLat: 37.7, maxLat: 37.8, minLng: -122.5, maxLng: -122.4 }, // San Francisco
    { minLat: -33.9, maxLat: -33.8, minLng: 151.2, maxLng: 151.3 }, // Sídney
    { minLat: -22.9, maxLat: -22.8, minLng: -43.2, maxLng: -43.1 }, // Río de Janeiro
    { minLat: 28.6, maxLat: 28.7, minLng: 77.2, maxLng: 77.3 }, // Delhi
    { minLat: 19.4, maxLat: 19.5, minLng: -99.2, maxLng: -99.1 }, // Ciudad de México
    { minLat: 55.7, maxLat: 55.8, minLng: 37.6, maxLng: 37.7 }, // Moscú
    { minLat: 39.9, maxLat: 40.0, minLng: 116.3, maxLng: 116.4 }, // Pekín
    { minLat: 22.2, maxLat: 22.3, minLng: 114.1, maxLng: 114.2 }, // Hong Kong
    { minLat: -34.6, maxLat: -34.5, minLng: -58.4, maxLng: -58.3 }, // Buenos Aires
    { minLat: 41.9, maxLat: 42.0, minLng: 12.4, maxLng: 12.5 }, // Roma
    { minLat: 52.5, maxLat: 52.6, minLng: 13.4, maxLng: 13.5 } // Berlín
  ];

  regiones.forEach(({ minLat, maxLat, minLng, maxLng }) => {
    for (let i = 0; i < cantidad; i++) {
      const userId = uuidv4();
      const lat = Math.random() * (maxLat - minLat) + minLat;
      const lng = Math.random() * (maxLng - minLng) + minLng;
      const color = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)];
      const size = Math.floor(Math.random() * 20) + 20;
      const intensidad = size / 4;

      const user = new User({
        userId,
        lat,
        lng,
        color,
        size,
        intensidad,
        city: null,
        country: null,
        timestamp: new Date(),
      });

      user.save()
        .then(() => console.log(`Usuario guardado: ${user.userId}`))
        .catch(err => console.error(`Error al guardar usuario: ${err}`));

      global.usuarios.push({ userId, lat, lng, color, size, intensidad, city: null, country: null });
    }
  });
}

// Generar usuarios iniciales
// generarUsuariosFalsosConcentrados();

// Socket.IO para manejar conexiones en tiempo real
io.on('connection', (socket) => {
  console.log(`Usuario conectado (socket): ${socket.id}`);

  socket.on('update_location', (data) => {
    const { userId, lat, lng, color, size, intensidad } = data;

    // Crear un nuevo registro para cada actualización en la base de datos
    const userUpdate = new User({
      userId,
      lat,
      lng,
      color,
      size,
      intensidad,
      city: null,
      country: null,
      timestamp: new Date(),
    });

    userUpdate.save()
      .then(() => {
        console.log(`Datos de ${userId} registrados en la base de datos.`);
      })
      .catch(err => console.error('Error al guardar actualización:', err));

    // Actualizar en memoria para el mapa
    const userIndex = global.usuarios.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      // Si el usuario ya existe, actualizamos su estado en memoria
      global.usuarios[userIndex] = { userId, lat, lng, color, size, intensidad, city: null, country: null };
    } else {
      // Si el usuario no existe en memoria, lo agregamos
      global.usuarios.push({ userId, lat, lng, color, size, intensidad, city: null, country: null });
    }

    // Resolver city y country para usuarios sin completar
    resolverUsuariosSinCityCountry(global.usuarios, cities);

    // Emitir lista actualizada de usuarios para el mapa
    io.emit('locations', global.usuarios);
  });

  socket.on("request_locations", () => {
    // Resolver city y country antes de enviar
    resolverUsuariosSinCityCountry(global.usuarios, cities);
    socket.emit('locations', global.usuarios);
  });

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

// Rutas de estadísticas (pasando usuarios dinámicamente)
const statsRoutesInstance = statsRoutes();
app.use('/api', statsRoutesInstance);

// Rutas de resolución
app.use('/api', resolveRoutes);

// // Servir el frontend de React
// app.use(express.static(path.join(__dirname, '..', 'emotion-map', 'build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '..', 'emotion-map', 'build', 'index.html'));
// });

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
