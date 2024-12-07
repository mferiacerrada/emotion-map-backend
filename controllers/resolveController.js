const { performClustering, findNearestCity } = require('../utils/clustering');
const { cities, countries } = require('../utils/loadGeoData');

const resolveCoordinates = (req, res) => {
    const users = req.body.users;
  
    if (!users || users.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron usuarios." });
    }
  
    const { clusters, centroids } = performClustering(users);
  
    if (centroids.length === 0) {
      return res.status(500).json({ error: "No se pudieron generar centroides." });
    }
  
    const clusterResults = centroids.map((centroid, index) => {
      const nearestCity = findNearestCity(centroid, cities);
      if (!nearestCity) {
        console.error(`No se encontró ciudad para el centroide: ${centroid}`);
        return null;
      }
  
      const country = countries.find(c => c.code === nearestCity.country_code);
  
      return country
        ? { city: nearestCity.name, country: country.name }
        : null;
    });
  
    const resolvedUsers = users.map((user, index) => {
      const clusterId = clusters[index];
      if (clusterId === -1 || !clusterResults[clusterId]) {
        console.error(`No se encontró resultado para el cluster: ${clusterId}`);
        return { ...user, city: null, country: null };
      }
  
      const { city, country } = clusterResults[clusterId];
      return { ...user, city, country };
    });
  
    res.json({ resolvedUsers });
  };
  

module.exports = { resolveCoordinates };
