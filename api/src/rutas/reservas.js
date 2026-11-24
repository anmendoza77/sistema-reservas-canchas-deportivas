const express = require('express');
const repositorio = require('../datos/repositorio');
const {
  HORA_APERTURA, HORA_CIERRE, MAX_RESERVAS_ACTIVAS_POR_DIA,
  validarHora, validarFecha, hayConflicto, superaLimiteDiario, calcularResumen
} = require('../logica/reglas-reservas');

const router = express.Router();

// Una sola funcion para responder: evita repetir res.status().json() en cada ruta.
function responder(res, codigo, datos) {
  res.status(codigo).json(datos);
}

router.get('/', (req, res) => {
  responder(res, 200, repositorio.listar());
});

router.get('/resumen', (req, res) => {
  responder(res, 200, calcularResumen(repositorio.listar()));
});

router.post('/', (req, res) => {
  const { nombre, cancha, fecha, hora } = req.body;

  if (!nombre || !cancha || !fecha || !hora) {
    return responder(res, 400, { error: 'Faltan datos: nombre, cancha, fecha y hora son obligatorios' });
  }
  if (!validarFecha(fecha)) {
    return responder(res, 400, { error: 'La fecha no es valida' });
  }
  if (!validarHora(hora)) {
    return responder(res, 400, {
      error: `La hora debe ser exacta (HH:00), desde las ${HORA_APERTURA}:00 y antes de las ${HORA_CIERRE}:00`
    });
  }

  const existentes = repositorio.listar();
  const nueva = { nombre, cancha, fecha, hora };

  if (hayConflicto(existentes, nueva)) {
    return responder(res, 409, { error: `La cancha ${cancha} ya esta reservada en ese horario` });
  }
  if (superaLimiteDiario(existentes, nueva)) {
    return responder(res, 409, {
      error: `${nombre} ya tiene ${MAX_RESERVAS_ACTIVAS_POR_DIA} reservas activas ese dia`
    });
  }

  const creada = repositorio.agregar({ id: Date.now(), ...nueva, estado: 'pendiente' });
  responder(res, 201, creada);
});

router.patch('/:id/cancelar', (req, res) => {
  const reserva = repositorio.cancelar(Number(req.params.id));
  if (!reserva) {
    return responder(res, 404, { error: 'No existe una reserva con ese id' });
  }
  responder(res, 200, reserva);
});

module.exports = router;