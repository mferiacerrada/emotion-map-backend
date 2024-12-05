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

function generarUsuariosFalsosConcentrados(cantidad = 5000) {
  const usuariosFalsos = [];
  const minLat = 40.4, maxLat = 40.5;
  const minLng = -3.7, maxLng = -3.6;

  for (let i = 0; i < cantidad; i++) {
    const userId = uuidv4();
    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;

    const color = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)];
    const size = Math.floor(Math.random() * 30) + 10; 
    
    usuariosFalsos.push({
      userId,
      lat,
      lng,
      color,
      size,
      intensidad: Math.random() * 1.0 // Intensidad entre 0 y 1, por ejemplo
    });
  }

  return usuariosFalsos;
}

// Generar y agregar usuarios falsos al array principal
const usuariosFalsos = generarUsuariosFalsos(500);
usuarios.push(...usuariosFalsos);

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Usuario conectado (socket): ${socket.id}`);

  socket.on('update_location', (data) => {
    const { userId, lat, lng, color, size } = data;
    const index = usuarios.findIndex(u => u.userId === userId);

    if (index !== -1) {
      usuarios[index] = { userId, lat, lng, color, size };
    } else {
      usuarios.push({ userId, lat, lng, color, size });
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
