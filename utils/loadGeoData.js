const fs = require('fs');
const path = require('path');

// Cargar datos de ciudades
const cities = fs
  .readFileSync(path.join(__dirname, '../data/cities15000.txt'), 'utf8')
  .split('\n')
  .map((line) => {
    const parts = line.split('\t');
    return {
      name: parts[1],
      lat: parseFloat(parts[4]),
      lng: parseFloat(parts[5]),
      country_code: parts[8],
    };
  });

// Cargar datos de países
const countries = fs
  .readFileSync(path.join(__dirname, '../data/countryInfo.txt'), 'utf8')
  .split('\n')
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    const parts = line.split('\t');
    return {
      code: parts[0],
      name: parts[4],
    };
  });

console.log("Ciudades cargadas:", cities.slice(0, 5)); // Muestra las primeras 5 ciudades


module.exports = { cities, countries };
