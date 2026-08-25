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

    mensaje.textContent = `Reserva realizada correctamente para ${nombre}.`;
    mensaje.style.color = "green";
}