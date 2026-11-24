const ESTADO_CANCELADA = 'cancelada';

export default function ListaReservas({ reservas, onCancelar }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th><th>Cancha</th><th>Fecha</th><th>Hora</th><th>Estado</th><th></th>
        </tr>
      </thead>
      <tbody>
        {reservas.map(r => (
          <tr key={r.id}>
            <td>{r.nombre}</td>
            <td>{r.cancha}</td>
            <td>{r.fecha}</td>
            <td>{r.hora}</td>
            <td>{r.estado}</td>
            <td>
              {r.estado !== ESTADO_CANCELADA && (
                <button onClick={() => onCancelar(r.id)}>Cancelar</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}