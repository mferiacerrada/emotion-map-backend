const calcularEstadisticas = (usuarios) => {
  const stats = {
    topPaises: [],
    topCiudades: []
  };

  const paises = {};
  const ciudades = {};

  usuarios.forEach((usuario) => {
    // Procesar por país
    if (usuario.country) {
      if (!paises[usuario.country]) {
        paises[usuario.country] = { 
          emocionDominante: usuario.color, 
          intensidadTotal: 0, 
          latitudes: [], 
          longitudes: [] 
        };
      }
      paises[usuario.country].intensidadTotal += usuario.intensidad;
      paises[usuario.country].latitudes.push(usuario.lat);
      paises[usuario.country].longitudes.push(usuario.lng);
    }

    // Procesar por ciudad
    if (usuario.city) {
      if (!ciudades[usuario.city]) {
        ciudades[usuario.city] = { 
          emocionDominante: usuario.color, 
          intensidadTotal: 0, 
          latitudes: [], 
          longitudes: [] 
        };
      }
      ciudades[usuario.city].intensidadTotal += usuario.intensidad;
      ciudades[usuario.city].latitudes.push(usuario.lat);
      ciudades[usuario.city].longitudes.push(usuario.lng);
    }
  });

  // Calcular coordenadas promedio para cada país
  for (const pais in paises) {
    const latitudes = paises[pais].latitudes;
    const longitudes = paises[pais].longitudes;
    paises[pais].lat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    paises[pais].lng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;
    delete paises[pais].latitudes;
    delete paises[pais].longitudes;
  }

  // Calcular coordenadas promedio para cada ciudad
  for (const ciudad in ciudades) {
    const latitudes = ciudades[ciudad].latitudes;
    const longitudes = ciudades[ciudad].longitudes;
    ciudades[ciudad].lat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    ciudades[ciudad].lng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;
    delete ciudades[ciudad].latitudes;
    delete ciudades[ciudad].longitudes;
  }

  // Ordenar y seleccionar los principales países
  stats.topPaises = Object.entries(paises)
    .map(([pais, data]) => ({ pais, ...data }))
    .sort((a, b) => b.intensidadTotal - a.intensidadTotal)
    .slice(0, 25);

  // Ordenar y seleccionar las principales ciudades
  stats.topCiudades = Object.entries(ciudades)
    .map(([ciudad, data]) => ({ ciudad, ...data }))
    .sort((a, b) => b.intensidadTotal - a.intensidadTotal)
    .slice(0, 25);

  return stats;
};

module.exports = calcularEstadisticas;
