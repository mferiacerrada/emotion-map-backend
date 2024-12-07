const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path'); // Importante para resolver la ruta del build

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// Array simple de usuarios
let usuarios = [];

// Conjunto de colores de ejemplo
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

// function generarUsuariosFalsos(cantidad = 500) {
//   const usuariosFalsos = [];

//   for (let i = 0; i < cantidad; i++) {
//     const userId = uuidv4();
//     const lat = (Math.random() * 180) - 90; // de -90 a 90
//     const lng = (Math.random() * 360) - 180; // de -180 a 180

//     const color = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)];
//     const size = Math.floor(Math.random() * 30) + 10; 
//     // Por ejemplo, tamaño entre 10 y 40

//     usuariosFalsos.push({
//       userId,
//       lat,
//       lng,
//       color,
//       size
//     });
//   }

//   return usuariosFalsos;
// }

// function generarUsuariosFalsosConcentrados(cantidad = 600) {
//   const usuariosFalsos = [];
//   const minLat = 40.4, maxLat = 40.5;
//   const minLng = -3.7, maxLng = -3.6;

//   for (let i = 0; i < cantidad; i++) {
//     const userId = uuidv4();
//     const lat = Math.random() * (maxLat - minLat) + minLat;
//     const lng = Math.random() * (maxLng - minLng) + minLng;

//     const color = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)];
//     const size = Math.floor(Math.random() * 30) + 10; 
    
//     usuariosFalsos.push({
//       userId,
//       lat,
//       lng,
//       color,
//       size,
//       intensidad: Math.random() * 1.0 // Intensidad entre 0 y 1, por ejemplo
//     });
//   }

//   return usuariosFalsos;
// }

function generarUsuariosFalsosConcentrados(cantidad = 10000) {
  const usuariosFalsos = [];
  const verde = "rgba(0, 255, 0, 0.8)";

  // Suponiendo que ya tienes `coloresDisponibles` definido
  const otrosColores = coloresDisponibles.filter(c => c !== verde);

  // Función para generar usuarios en una región
  const generarUsuariosEnRegion = (minLat, maxLat, minLng, maxLng, cantidad) => {
    for (let i = 0; i < cantidad; i++) {
      const userId = uuidv4();
      const lat = Math.random() * (maxLat - minLat) + minLat;
      const lng = Math.random() * (maxLng - minLng) + minLng;

      const color = Math.random() < 0.5
        ? verde
        : otrosColores[Math.floor(Math.random() * otrosColores.length)];

      const size = Math.floor(Math.random() * 20) + 20; // Tamaño entre 20 y 40
      const intensidad = size/4;

      usuariosFalsos.push({
        userId,
        lat,
        lng,
        color,
        size,
        intensidad
      });
    }
  };

  // Generar usuarios en diferentes regiones
  const regiones = [
    { minLat: 40.4, maxLat: 40.5, minLng: -3.7, maxLng: -3.6 }, // Madrid
    { minLat: 40.7, maxLat: 40.8, minLng: -74.0, maxLng: -73.9 }, // Nueva York
    { minLat: 48.85, maxLat: 48.9, minLng: 2.3, maxLng: 2.4 }, // París
    { minLat: 35.6, maxLat: 35.7, minLng: 139.7, maxLng: 139.8 }, // Tokio
    { minLat: -33.9, maxLat: -33.8, minLng: 151.2, maxLng: 151.3 }, // Sídney
    { minLat: 51.5, maxLat: 51.6, minLng: -0.1, maxLng: 0.0 }, // Londres
    { minLat: -33.95, maxLat: -33.9, minLng: 18.4, maxLng: 18.5 }, // Ciudad del Cabo
    { minLat: -22.95, maxLat: -22.9, minLng: -43.2, maxLng: -43.1 }, // Río de Janeiro
    { minLat: 25.2, maxLat: 25.3, minLng: 55.2, maxLng: 55.3 } // Dubái
  ];

  // Generar usuarios para cada región
  regiones.forEach(region => {
    generarUsuariosEnRegion(region.minLat, region.maxLat, region.minLng, region.maxLng, cantidad);
  });

  return usuariosFalsos;
}

// Generar y agregar usuarios falsos al array principal
const usuariosFalsos = generarUsuariosFalsosConcentrados(50);
usuarios.push(...usuariosFalsos);

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Usuario conectado (socket): ${socket.id}`);

  socket.on('update_location', (data) => {
    const { userId, lat, lng, color, size,intensidad } = data;
    const index = usuarios.findIndex(u => u.userId === userId);

    if (index !== -1) {
      usuarios[index] = { userId, lat, lng, color, size,intensidad };
    } else {
      usuarios.push({ userId, lat, lng, color, size,intensidad });
    }

    io.emit('locations', usuarios);
  });

  socket.on("request_locations", () => {
    socket.emit('locations', usuarios);
  });

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    // Aquí podrías agregar lógica para remover el usuario si tienes su userId
  });
});

// Servir el frontend de React (build de emotion-map)
app.use(express.static(path.join(__dirname, '..', 'emotion-map', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'emotion-map', 'build', 'index.html'));
});

// Iniciar el servidor
server.listen(3001, () => {
  console.log('Servidor escuchando en http://localhost:3001');
});
