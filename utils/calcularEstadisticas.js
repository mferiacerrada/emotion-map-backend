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
          paises[usuario.country] = { emocionDominante: usuario.color, intensidadTotal: 0 };
        }
        paises[usuario.country].intensidadTotal += usuario.intensidad;
      }
  
      // Procesar por ciudad
      if (usuario.city) {
        if (!ciudades[usuario.city]) {
          ciudades[usuario.city] = { emocionDominante: usuario.color, intensidadTotal: 0 };
        }
        ciudades[usuario.city].intensidadTotal += usuario.intensidad;
      }
    });
  
    // Ordenar y seleccionar los principales países
    stats.topPaises = Object.entries(paises)
      .map(([pais, data]) => ({ pais, ...data }))
      .sort((a, b) => b.intensidadTotal - a.intensidadTotal)
      .slice(0, 10);
  
    // Ordenar y seleccionar las principales ciudades
    stats.topCiudades = Object.entries(ciudades)
      .map(([ciudad, data]) => ({ ciudad, ...data }))
      .sort((a, b) => b.intensidadTotal - a.intensidadTotal)
      .slice(0, 10);
  
    return stats;
  };
  
  module.exports = calcularEstadisticas;
  