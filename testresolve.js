const { resolveCoordinates } = require('./controllers/resolveController');
const { cities, countries } = require('./utils/loadGeoData');

// JSON de prueba
const testUsers = {
  users: [
    { userId: "u1", lat: 40.416180728405564, lng: -3.703875333566136 },
    { userId: "u2", lat: 48.8566, lng: 2.3522 },
    { userId: "u3", lat: 35.6895, lng: 139.6917 }
  ]
};

// Simular la solicitud al controlador
const mockReq = { body: testUsers };
const mockRes = {
  json: (data) => {
    console.log("Respuesta:", JSON.stringify(data, null, 2));
  }
};

// Ejecutar el controlador
resolveCoordinates(mockReq, mockRes);
