import { useState } from 'react';
import Campo from './Campo';

const VACIO = { nombre: '', cancha: '', fecha: '', hora: '' };

export default function Formulario({ onCrear }) {
  const [datos, setDatos] = useState(VACIO);

  function cambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    // Las reglas (horario, choques, limite diario) las valida el servidor.
    const creada = await onCrear(datos);
    if (creada) setDatos(VACIO);
  }

  return (
    <form onSubmit={enviar}>
      <Campo etiqueta="Nombre" nombre="nombre" valor={datos.nombre} onCambio={cambiar} />
      <Campo etiqueta="Cancha" nombre="cancha" valor={datos.cancha} onCambio={cambiar} />
      <Campo etiqueta="Fecha" nombre="fecha" tipo="date" valor={datos.fecha} onCambio={cambiar} />
      <Campo etiqueta="Hora" nombre="hora" tipo="time" valor={datos.hora} onCambio={cambiar} />
      <button type="submit">Reservar</button>
    </form>
  );
}