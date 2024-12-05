const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

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

function generarUsuariosFalsos(cantidad = 500) {
  const usuariosFalsos = [];

  for (let i = 0; i < cantidad; i++) {
    const userId = uuidv4();
    const lat = (Math.random() * 180) - 90; // de -90 a 90
    const lng = (Math.random() * 360) - 180; // de -180 a 180

    const color = coloresDisponibles[Math.floor(Math.random() * coloresDisponibles.length)];
    const size = Math.floor(Math.random() * 30) + 10; 
    // Por ejemplo, tamaño entre 10 y 40 (puedes ajustar este rango)

    usuariosFalsos.push({
      userId,
      lat,
      lng,
      color,
      size
    });
  }

  return usuariosFalsos;
}

// Ejemplo de uso (dentro de tu server.js, después de definir usuarios y antes de emitir locations)
// Supongamos que ya tienes el array "usuarios" en tu servidor:
const usuariosFalsos = generarUsuariosFalsos(500);
usuarios.push(...usuariosFalsos);

// Evento de conexión de Socket.IO
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
      // Cuando el cliente pida las ubicaciones, las enviamos
      socket.emit('locations', usuarios);
    });
  
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
      // Aquí puedes agregar lógica para remover el usuario si tienes su userId
    });
  });
  

server.listen(3001, () => {
  console.log('Servidor escuchando en http://localhost:3001');
});
