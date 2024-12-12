const User = require('../models/User');

const calcularOndaTemporal = async (intervaloTotal, resolucion) => {
    const ahora = new Date(); // Objeto de fecha actual
    let fechaInicio;

    switch (intervaloTotal) {
    case '6m':
        fechaInicio = new Date(ahora.getTime()); // Clona la fecha actual
        fechaInicio.setMonth(fechaInicio.getMonth() - 6); // Resta 6 meses
        break;
    case '3m':
        fechaInicio = new Date(ahora.getTime());
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        break;
    case '1m':
        fechaInicio = new Date(ahora.getTime());
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
    case '1w':
        fechaInicio = new Date(ahora.getTime());
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        break;
    case '1d':
        fechaInicio = new Date(ahora.getTime());
        fechaInicio.setDate(fechaInicio.getDate() - 1);
        break;
    default:
        throw new Error('Intervalo total no válido');
    }

    console.log('Intervalo total:', { intervaloTotal, fechaInicio, ahora });

  
    let pasoMs;
    switch (resolucion) {
        case '1m': // 1 mes
          pasoMs = 30 * 24 * 60 * 60 * 1000; // Aproximación: 30 días
          break;
        case '2w': // 2 semanas
          pasoMs = 14 * 24 * 60 * 60 * 1000;
          break;
        case '1w': // 1 semana
          pasoMs = 7 * 24 * 60 * 60 * 1000;
          break;
        case '3d': // 3 días
          pasoMs = 3 * 24 * 60 * 60 * 1000;
          break;
        case '1d': // 1 día
          pasoMs = 24 * 60 * 60 * 1000;
          break;
        case '1h': // 1 hora
          pasoMs = 60 * 60 * 1000;
          break;
        case '30m': // 30 minutos
          pasoMs = 30 * 60 * 1000;
          break;
        default:
          throw new Error('Resolución no válida');
      }
      
  
    console.log('Resolución (paso en ms):', pasoMs);
  
    const onda = [];
    for (let t = fechaInicio.getTime(); t < ahora.getTime(); t += pasoMs) {
      const inicio = new Date(t);
      const fin = new Date(t + pasoMs);
  
      console.log('Segmento temporal:', { inicio, fin });
  
      const datos = await User.aggregate([
        {
          $match: {
            timestamp: { $gte: inicio, $lt: fin },
          },
        },
        {
          $group: {
            _id: '$color',
            intensidadTotal: { $sum: '$intensidad' },
          },
        },
        {
          $sort: { intensidadTotal: -1 },
        },
      ]);
  
      console.log('Datos del segmento:', datos);
  
      if (datos.length > 0) {
        onda.push({
          inicio,
          fin,
          colorDominante: datos[0]._id,
          intensidad: datos[0].intensidadTotal,
        });
      } else {
        onda.push({
          inicio,
          fin,
          colorDominante: null,
          intensidad: 0,
        });
      }
    }
  
    return onda;
  };
  

module.exports = calcularOndaTemporal;
