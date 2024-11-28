import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    collection,
    query,
    orderBy,
    limit,
    getFirestore,
    doc,
    setDoc,
    getDoc,getDocs,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAIutw__qzk2i31w6eo4mSL6c4a122afa946",
    authDomain: "cafeteria-ujat-eb2b0.firebaseapp.com",
    projectId: "cafeteria-ujat-eb2b0",
    storageBucket: "cafeteria-ujat.eb2b0.appspot.com",
    messagingSenderId: "269489762867",
    appId: "1:269489762867:web:4f228461f6c4a122afa946",
    measurementId: "G-S6L7HNSX72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    // Obtener carrito desde localStorage
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
        alert("El carrito está vacío. Redirigiendo...");
        window.location.href = "menu.html";
        return;
    }

    // Mostrar productos del carrito
    const listaCarrito = document.getElementById("lista-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    listaCarrito.innerHTML = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        return `<li>${item.nombre} - ${item.cantidad} x $${item.precio.toFixed(2)} 
                <span style="font-weight: bold;">Subtotal: $${subtotal.toFixed(2)}</span></li>`;
    }).join("");
    

    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    totalCarrito.textContent = total.toFixed(2);

    // Cargar datos del usuario logueado desde Firestore
    const sesion = JSON.parse(localStorage.getItem("sesionActiva"));
    try {
        const docRef = doc(db, "Usuarios", sesion.id_usuario); // Cambiado a id_usuario
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const usuario = docSnap.data();

            // Llenar los datos del cliente
            document.getElementById("nombre").textContent = usuario.nombre || "No disponible";
            document.getElementById("matricula").textContent = sesion.id_usuario || "No disponible"; 
            document.getElementById("email").textContent = usuario.correo || "No disponible";

            //Guardamos 
            localStorage.setItem("cliente-nombre", usuario.nombre || "No disponible");
            localStorage.setItem("cliente-matricula", sesion.id_usuario || "No disponible");
            localStorage.setItem("cliente-email", usuario.correo || "No disponible");
        } else {
            console.error("No se encontró información del usuario.");
        }
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
    }
});


// Evento para finalizar la compra
document.getElementById("btn-comprar-ahora").addEventListener("click", async () => {
    // Validar teléfono
    const telefono = document.getElementById("telefono").value.trim();
    if (!telefono) {
        alert("Por favor, ingresa tu número de teléfono.");
        return;
    }

    // Obtener método de pago y carrito
    const metodoPago = document.querySelector('input[name="pago"]:checked').value;
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const sesion = JSON.parse(localStorage.getItem("sesionActiva"));

    if (carrito.length === 0) {
        alert("El carrito está vacío. No puedes realizar una compra.");
        return;
    }

    try {
        // Iterar sobre los productos del carrito y validar inventario
        for (const item of carrito) {
            const productoRef = doc(db, "Inventario", item.id_producto.toString());
            const productoSnap = await getDoc(productoRef);

            if (!productoSnap.exists()) {
                console.error(`Producto no encontrado en el inventario: ${item.nombre}`);
                alert(`El producto "${item.nombre}" no está disponible en el inventario.`);
                return;
            }

            const producto = productoSnap.data();
            const nuevaCantidad = producto.cantidad - item.cantidad;

            if (nuevaCantidad < 0) {
                alert(
                    `No hay suficiente inventario para "${item.nombre}". Cantidad disponible: ${producto.cantidad}.`
                );
                return;
            }

            // Actualizar inventario en Firestore
            await updateDoc(productoRef, { cantidad: nuevaCantidad });
        }
        // Registrar el pedido
        registrarPedido(carrito, sesion);

        // Generar reporte de ventas
        await generarReporteDeVentas(carrito);

        // Guardar resumen del carrito para el ticket
        localStorage.setItem("resumenCompra", JSON.stringify(carrito));
        localStorage.setItem("cliente-telefono", telefono);
        localStorage.setItem("metodo-pago", metodoPago);

        // Vaciar el carrito
        localStorage.removeItem("carrito");

        alert("Compra realizada con éxito.");
        window.location.href = "ticket.html";
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert("Hubo un error al procesar la compra. Inténtalo de nuevo.");
    }
});

// Función para obtener el siguiente ID de reporte
async function obtenerSiguienteIdReporte() {
    try {
        const reportesRef = collection(db, "Reportes de venta");
        const q = query(reportesRef, orderBy("id_reporte", "desc"), limit(1)); // Ordenar por id_reporte
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const ultimoReporte = snapshot.docs[0].data();
            const ultimoId = parseInt(ultimoReporte.id_reporte); // Asegurarse de tratarlo como número
            return isNaN(ultimoId) ? 1 : ultimoId + 1; // Incrementar el ID si es válido
        } else {
            return 1; // Si no hay reportes, el ID inicial será 1
        }
    } catch (error) {
        console.error("Error al obtener el siguiente ID de reporte:", error);
        return 1;
    }
}

// Generar reportes de ventas
async function generarReporteDeVentas(carrito) {
    try {
        // Obtener el siguiente ID de reporte
        const nuevoIdReporte = await obtenerSiguienteIdReporte();
        const reporteRef = doc(db, "Reportes de venta", nuevoIdReporte.toString());

        // Crear objeto de productos vendidos
        const productosVendidos = {};
        let cantidadTotalVendida = 0; // Variable para almacenar la cantidad total vendida
        let totalVentas = 0; // Variable para almacenar la suma total de los precios

        carrito.forEach((item) => {
            if (!productosVendidos[item.nombre]) {
                productosVendidos[item.nombre] = 0;
            }
            productosVendidos[item.nombre] += item.cantidad; // Incrementar cantidad del producto vendido
            cantidadTotalVendida += item.cantidad; // Sumar la cantidad vendida de este producto
            totalVentas += item.precio * item.cantidad; // Sumar el total del producto al total general
        });

        // Crear el reporte
        const reporte = {
            id_reporte: nuevoIdReporte,
            fecha: new Date(), // Fecha completa de la compra en formato ISO
            ventas_totales: totalVentas, // Total en pesos
            mas_vendido: productosVendidos, // Productos vendidos con sus cantidades
            cantidad_vendida: cantidadTotalVendida, // Cantidad total de productos vendidos
        };

        // Guardar reporte en Firestore
        await setDoc(reporteRef, reporte);

        console.log("Reporte de ventas generado con éxito.");
    } catch (error) {
        console.error("Error al generar el reporte de ventas:", error);
    }
}

// Función para obtener el siguiente ID de pedido
async function obtenerSiguienteIdPedido() {
    try {
        const pedidosRef = collection(db, "Pedidos");
        const q = query(pedidosRef, orderBy("id_pedido", "desc"), limit(1)); // Ordenar por id_pedido en orden descendente
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const ultimoPedido = snapshot.docs[0].data();
            const ultimoId = parseInt(ultimoPedido.id_pedido); // Asegurarse de tratarlo como número
            return isNaN(ultimoId) ? 1 : ultimoId + 1; // Incrementar el ID si es válido
        } else {
            return 1; // Si no hay pedidos, el ID inicial será 1
        }
    } catch (error) {
        console.error("Error al obtener el siguiente ID de pedido:", error);
        return 1; // Retornar 1 en caso de error para evitar bloqueos
    }
}

async function obtenerSiguienteIdDetalle() {
    try {
        const detallesRef = collection(db, "Detalle de los pedidos");
        const q = query(detallesRef, orderBy("id_detalle", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const ultimoDetalle = snapshot.docs[0].data();
            const ultimoId = parseInt(ultimoDetalle.id_detalle);
            return isNaN(ultimoId) ? 1 : ultimoId + 1;
        } else {
            return 1; // Si no hay detalles, el ID inicial será 1
        }
    } catch (error) {
        console.error("Error al obtener el siguiente ID de detalle:", error);
        return 1;
    }
}

async function registrarPedido(carrito, sesion) {
    try {
        // Obtener el siguiente ID de pedido
        const nuevoIdPedido = await obtenerSiguienteIdPedido();
        const pedidoRef = doc(db, "Pedido", nuevoIdPedido.toString());

        // Crear objeto del pedido
        const pedido = {
            id_pedido: nuevoIdPedido,
            fecha: new Date(), // Fecha actual en formato ISO
            hora_recoger: "", // Inicialmente vacío
            estado_pedido: "Pendiente", // Estado inicial
            id_usuario: sesion.id_usuario, // ID del usuario
        };

        // Guardar pedido en Firestore
        await setDoc(pedidoRef, pedido);

        // Guardar detalles del pedido en la colección `Detalle de los pedidos`
        for (const item of carrito) {
            // Obtener el siguiente ID de detalle para cada producto
            const nuevoIdDetalle = await obtenerSiguienteIdDetalle();
            const detalleRef = doc(
                db,
                "Detalle de los pedidos",
                nuevoIdDetalle.toString()
            );

            const detalle = {
                id_detalle: nuevoIdDetalle,
                id_pedido: nuevoIdPedido,
                id_producto: item.id_producto,
                cantidad: item.cantidad,
            };

            await setDoc(detalleRef, detalle);
        }

        console.log("Pedido y detalles registrados exitosamente.");
    } catch (error) {
        console.error("Error al registrar el pedido:", error);
    }
}