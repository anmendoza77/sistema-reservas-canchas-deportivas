const { ESTADO_CANCELADA } = require('../logica/reglas-reservas');

// Almacenamiento en memoria: se reinicia cada vez que arranca el servidor.
const reservas = [
  { id: 1, nombre: 'Ana', cancha: 'Futbol 1', fecha: '2026-12-01', hora: '10:00', estado: 'confirmada' },
  { id: 2, nombre: 'Luis', cancha: 'Tenis', fecha: '2026-12-02', hora: '15:00', estado: 'pendiente' }
];

function listar() {
  return reservas;
}

function agregar(reserva) {
  reservas.push(reserva);
  return reserva;
}

function cancelar(id) {
  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return null;
  reserva.estado = ESTADO_CANCELADA;
  return reserva;
}

module.exports = { listar, agregar, cancelar };