
// HEMOS MODIFICADO EL CODIGO PARA COGER SOLO ciudades por encima de los 100.000 habitantes, antes era 15000

const fs = require('fs');
const path = require('path');

const citiesFilePath = path.resolve(__dirname, 'cities15000.txt');
const countryFilePath = path.resolve(__dirname, 'countryInfo.txt');


// Cargar datos de ciudades
const cities = fs
  .readFileSync(citiesFilePath, 'utf8')
  // .readFileSync(path.join(__dirname, '..', 'data', 'cities15000.txt'), 'utf8')
  // .readFileSync(path.join(__dirname, '../data/cities15000.txt'), 'utf8')
  .split('\n')
  .map((line) => {
    const parts = line.split('\t');
    return {
      name: parts[1], // Nombre de la ciudad
      lat: parseFloat(parts[4]), // Latitud
      lng: parseFloat(parts[5]), // Longitud
      country_code: parts[8], // Código de país
      population: parseInt(parts[14], 10), // Población (columna 14)
    };
  })
  .filter((city) => city.population > 300000); // Filtrar ciudades con más de 150,000 habitantes

// Cargar datos de países
const countries = fs
  .readFileSync(countryFilePath, 'utf8')
  // .readFileSync(path.join(__dirname, '..','data','countryInfo.txt'), 'utf8')
  // .readFileSync(path.join(__dirname, '../data/countryInfo.txt'), 'utf8')
  .split('\n')
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    const parts = line.split('\t');
    return {
      code: parts[0], // Código de país
      name: parts[4], // Nombre del país
    };
  });

console.log("Ciudades cargadas:", cities.slice(0, 5)); // Muestra las primeras 5 ciudades

module.exports = { cities, countries };

