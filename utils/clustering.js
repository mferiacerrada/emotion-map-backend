const { getDistance } = require("geolib");

// Realizar clustering
const performClustering = (users) => {
  const coordinates = users.map((user) => [user.lat, user.lng]);

  if (coordinates.length <= 1) {
    console.error("No hay suficientes puntos para agrupar.");
    return { clusters: coordinates.map(() => -1), centroids: [] };
  }

  const MAX_DISTANCE_THRESHOLD = 50 * 1000; // 50 km en metros
  const clusters = Array(coordinates.length).fill(-1);
  const centroids = [];

  coordinates.forEach((coord, index) => {
    let assigned = false;

    for (let i = 0; i < centroids.length; i++) {
      const dist = getDistance(
        { latitude: coord[0], longitude: coord[1] },
        { latitude: centroids[i][0], longitude: centroids[i][1] }
      );

      if (dist <= MAX_DISTANCE_THRESHOLD) {
        clusters[index] = i;
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      // Crear un nuevo cluster si el punto no se asigna a ninguno existente
      clusters[index] = centroids.length;
      centroids.push(coord);
    }
  });

  console.log("Clusters asignados:", clusters);
  console.log("Centroides finales:", centroids);

  return { clusters, centroids };
};

// Buscar la ciudad más cercana a un centroide
const findNearestCity = (centroid, cities) => {
  if (!centroid || !Array.isArray(centroid) || centroid.length < 2) {
    console.error("Centroid inválido:", centroid);
    return null;
  }

  if (!Array.isArray(cities) || cities.length === 0) {
    console.error("La lista de ciudades es inválida o está vacía.");
    return null;
  }

  const nearestCity = cities.reduce(
    (nearest, city) => {
      const dist = getDistance(
        { latitude: centroid[0], longitude: centroid[1] },
        { latitude: city.lat, longitude: city.lng }
      );
      return dist < nearest.distance ? { ...city, distance: dist } : nearest;
    },
    { distance: Infinity }
  );

  return nearestCity.distance < 50 * 1000 ? nearestCity : null;
};

// Resolver city y country para usuarios sin completar dentro de clusters
const resolverUsuariosSinCityCountry = (users, cities, countries) => {
  // Validaciones iniciales
  if (!Array.isArray(users) || users.length === 0) {
    console.error("La lista de usuarios es inválida o está vacía.");
    return;
  }

  if (!Array.isArray(cities) || cities.length === 0) {
    console.error("La lista de ciudades es inválida o está vacía.");
    return;
  }

  if (!Array.isArray(countries) || countries.length === 0) {
    console.error("La lista de países es inválida o está vacía.");
    return;
  }

  const { clusters, centroids } = performClustering(users);

  users.forEach((user, index) => {
    if (!user.city || !user.country) {
      const clusterId = clusters[index];
      const usuariosCercanos = users.filter(
        (_, i) =>
          clusters[i] === clusterId && users[i].city && users[i].country
      );

      if (usuariosCercanos.length > 0) {
        // Asignar city y country del usuario cercano
        const usuarioCercano = usuariosCercanos[0];
        user.city = usuarioCercano.city;
        user.country = usuarioCercano.country;
      } else if (centroids[clusterId]) {
        const nearestCity = findNearestCity(centroids[clusterId], cities);
        if (nearestCity) {
          user.city = nearestCity.name;
          const country = Array.isArray(countries)
            ? countries.find((c) => c.code === nearestCity.country_code)
            : null;
          user.country = country ? country.name : "Desconocido";
        } else {
          console.warn(
            `No se encontró una ciudad cercana válida para el cluster ${clusterId}.`
          );
        }
      }
    }
  });
};

module.exports = { performClustering, findNearestCity, resolverUsuariosSinCityCountry };
