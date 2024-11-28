document.addEventListener("DOMContentLoaded", () => {
    const resumenCompra = JSON.parse(localStorage.getItem("resumenCompra")) || [];
    const total = resumenCompra.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    const listaCarrito = document.getElementById("ticket-lista-carrito");
    listaCarrito.innerHTML = resumenCompra.length
        ? resumenCompra.map(item => `
            <li>
                <strong>${item.nombre}</strong> - ${item.cantidad} x $${item.precio.toFixed(2)}
                <br>
                <span style="font-weight: bold;">Subtotal: $${(item.precio * item.cantidad).toFixed(2)}</span>
            </li>
        `).join("")
        : "<li>No hay productos en el carrito</li>";

    document.getElementById("ticket-total").textContent = `$${total.toFixed(2)}`;

    // Recuperar datos del cliente desde localStorage
    document.getElementById("ticket-nombre").textContent = localStorage.getItem("cliente-nombre") || "No proporcionado";
    document.getElementById("ticket-matricula").textContent = localStorage.getItem("cliente-matricula")?.trim() || "No proporcionado";
    document.getElementById("ticket-email").textContent = localStorage.getItem("cliente-email") || "No proporcionado";
    document.getElementById("ticket-telefono").textContent = localStorage.getItem("cliente-telefono") || "No proporcionado";

    // Mostrar método de pago
    document.getElementById("ticket-metodo-pago").textContent = localStorage.getItem("metodo-pago") || "No especificado";
});

// Función para manejar el botón "Finalizar Compra"
document.getElementById("btn-finalizar").addEventListener("click", () => {
    localStorage.removeItem("resumenCompra"); // Limpiar después de usar
    window.location.href = "index.html";
});



function HTMLtoPDF() {
    const { jsPDF } = window.jspdf; // Asegurarse de usar la versión correcta de jsPDF
    const source = document.getElementById("HTMLtoPDF");

    const pdf = new jsPDF("p", "pt", "a4"); // Formato de página A4
    const options = {
        html2canvas: {
            scale: 2, // Escala para mejorar la calidad
            useCORS: true, // Permitir imágenes externas
        },
        jsPDF: {
            unit: "pt",
            format: "a4",
        },
    };
    pdf.html(source, {
        callback: function (doc) {
            doc.save("Ticket.pdf"); // Descarga del PDF
        },
        margin: [10, 10, 10, 10], // Márgenes del contenido
        x: 10,
        y: 10,
        html2canvas: options.html2canvas,
    });
}


// Función para manejar el botón "Finalizar Compra"
document.getElementById("btn-finalizar").addEventListener("click", () => {
    localStorage.removeItem("carrito");
    window.location.href = "index.html";
});
