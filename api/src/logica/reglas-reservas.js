// Horario de la cancha. Si cambia la politica, cambia aqui y en ninguna otra parte.
const HORA_APERTURA = 6;
const HORA_CIERRE = 22;
const MAX_RESERVAS_ACTIVAS_POR_DIA = 2;
const ESTADO_CANCELADA = 'cancelada';

// Las comparaciones de texto ignoran mayusculas y espacios sobrantes.
function normalizar(texto) {
  return String(texto).trim().toLowerCase();
}

function esActiva(reserva) {
  return reserva.estado !== ESTADO_CANCELADA;
}

// La hora debe ser exacta (HH:00), desde la apertura y antes del cierre.
function validarHora(hora) {
  const partes = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!partes) return false;
  const h = Number(partes[1]);
  const min = Number(partes[2]);
  return min === 0 && h >= HORA_APERTURA && h < HORA_CIERRE;
}

function validarFecha(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  return !isNaN(new Date(`${fecha}T00:00:00`));
}

// Dos reservas chocan si son de la misma cancha, fecha y hora.
function hayConflicto(existentes, nueva) {
  return existentes.some(r =>
    esActiva(r) &&
    normalizar(r.cancha) === normalizar(nueva.cancha) &&
    r.fecha === nueva.fecha &&
    r.hora === nueva.hora
  );
}

// Una persona no puede tener mas de MAX_RESERVAS_ACTIVAS_POR_DIA reservas el mismo dia.
function superaLimiteDiario(existentes, nueva) {
  const delDia = existentes.filter(r =>
    esActiva(r) &&
    normalizar(r.nombre) === normalizar(nueva.nombre) &&
    r.fecha === nueva.fecha
  );
  return delDia.length >= MAX_RESERVAS_ACTIVAS_POR_DIA;
}

function calcularResumen(reservas) {
  const activas = reservas.filter(esActiva);
  return {
    total: reservas.length,
    activas: activas.length,
    canceladas: reservas.length - activas.length
  };
}

module.exports = {
  HORA_APERTURA, HORA_CIERRE, MAX_RESERVAS_ACTIVAS_POR_DIA, ESTADO_CANCELADA,
  validarHora, validarFecha, hayConflicto, superaLimiteDiario, calcularResumen
};