import { describe, it, expect } from 'vitest';
const {
  validarHora, validarFecha, hayConflicto, superaLimiteDiario, calcularResumen
} = require('./reglas-reservas');

describe('validarHora', () => {
  it('acepta la hora de apertura exacta (06:00)', () => {
    expect(validarHora('06:00')).toBe(true);
  });
  it('rechaza la hora de cierre (22:00)', () => {
    expect(validarHora('22:00')).toBe(false);
  });
  it('rechaza una hora antes de abrir', () => {
    expect(validarHora('05:00')).toBe(false);
  });
  it('rechaza horas que no son exactas', () => {
    expect(validarHora('10:30')).toBe(false);
  });
});

describe('validarFecha', () => {
  it('acepta una fecha valida', () => {
    expect(validarFecha('2026-12-01')).toBe(true);
  });
  it('rechaza una fecha imposible', () => {
    expect(validarFecha('2026-13-45')).toBe(false);
  });
});

describe('hayConflicto', () => {
  const existentes = [
    { nombre: 'Ana', cancha: 'Futbol 1', fecha: '2026-12-01', hora: '10:00', estado: 'confirmada' },
    { nombre: 'Luis', cancha: 'Tenis', fecha: '2026-12-01', hora: '11:00', estado: 'cancelada' }
  ];
  it('detecta la misma cancha, fecha y hora', () => {
    expect(hayConflicto(existentes, { cancha: 'Futbol 1', fecha: '2026-12-01', hora: '10:00' })).toBe(true);
  });
  it('no choca con una reserva cancelada', () => {
    expect(hayConflicto(existentes, { cancha: 'Tenis', fecha: '2026-12-01', hora: '11:00' })).toBe(false);
  });
  it('detecta el choque aunque la cancha cambie en mayusculas', () => {
    expect(hayConflicto(existentes, { cancha: 'futbol 1', fecha: '2026-12-01', hora: '10:00' })).toBe(true);
  });
});

describe('superaLimiteDiario', () => {
  const una = [{ nombre: 'Ana', fecha: '2026-12-01', estado: 'confirmada' }];
  const dos = [...una, { nombre: 'ana', fecha: '2026-12-01', estado: 'confirmada' }];
  it('permite la segunda reserva del dia (limite exacto)', () => {
    expect(superaLimiteDiario(una, { nombre: 'Ana', fecha: '2026-12-01' })).toBe(false);
  });
  it('rechaza la tercera reserva del dia', () => {
    expect(superaLimiteDiario(dos, { nombre: 'Ana', fecha: '2026-12-01' })).toBe(true);
  });
});

describe('calcularResumen', () => {
  it('devuelve ceros con una lista vacia', () => {
    expect(calcularResumen([])).toEqual({ total: 0, activas: 0, canceladas: 0 });
  });
});