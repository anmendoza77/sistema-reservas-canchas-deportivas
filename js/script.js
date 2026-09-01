let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

function reservarCancha() {
    const nombre = document.getElementById("nombre").value;
    const cancha = document.getElementById("cancha").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const mensaje = document.getElementById("mensaje");

    if (nombre === "" || cancha === "" || fecha === "" || hora === "") {
        mensaje.textContent = "Por favor, completa todos los campos.";
        mensaje.style.color = "red";
        return;
    }

    const yaExiste = reservas.some(
        (r) => r.cancha === cancha && r.fecha === fecha && r.hora === hora
    );

    if (yaExiste) {
        mensaje.textContent = "Ya existe una reserva para esa cancha, fecha y hora.";
        mensaje.style.color = "red";
        return;
    }

    const nuevaReserva = { id: Date.now(), nombre, cancha, fecha, hora };
    reservas.push(nuevaReserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    mensaje.textContent = `Reserva realizada correctamente para ${nombre}.`;
    mensaje.style.color = "green";

    document.querySelector("form").reset();
    mostrarReservas();
}

function cancelarReserva(id) {
    reservas = reservas.filter((r) => r.id !== id);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas();
}

function mostrarReservas() {
    const lista = document.getElementById("listaReservas");
    lista.innerHTML = "";

    if (reservas.length === 0) {
        lista.innerHTML = "<li>No hay reservas todavía.</li>";
        return;
    }

    reservas.forEach((r) => {
        const item = document.createElement("li");
        item.innerHTML = `
            ${r.nombre} - ${r.cancha} - ${r.fecha} ${r.hora}
            <button onclick="cancelarReserva(${r.id})">Cancelar</button>
        `;
        lista.appendChild(item);
    });
}

document.addEventListener("DOMContentLoaded", mostrarReservas);