import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
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

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elemento donde se mostrarán los pedidos
const pedidosContainer = document.getElementById("pedidos-container");

// Función para cargar los pedidos desde Firestore
async function cargarPedidos() {
    pedidosContainer.innerHTML = "<p>Cargando pedidos...</p>";

    try {
        // Obtener la sesión del usuario actual
        const sesion = JSON.parse(localStorage.getItem("sesionActiva"));
        if (!sesion || !sesion.id_usuario) {
            pedidosContainer.innerHTML = "<p>No has iniciado sesión.</p>";
            return;
        }

        // Consultar los pedidos del usuario actual
        const pedidosRef = collection(db, "Pedido");
        const q = query(pedidosRef, where("id_usuario", "==", sesion.id_usuario));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            pedidosContainer.innerHTML = "<p>No tienes pedidos registrados.</p>";
            return;
        }

        // Mostrar los pedidos
        pedidosContainer.innerHTML = ""; // Limpiar el contenedor
        snapshot.forEach((doc) => {
            const pedido = doc.data();

            // Crear un elemento para cada pedido
            const pedidoElement = document.createElement("div");
            pedidoElement.classList.add("pedido");

            pedidoElement.innerHTML = `
                <h3>Pedido #${pedido.id_pedido}</h3>
                <p><strong>Fecha:</strong> ${new Date(pedido.fecha.seconds * 1000).toLocaleDateString()}</p>
                <p><strong>Hora de Recoger:</strong> ${
                    pedido.hora_recoger
                        ? new Date(pedido.hora_recoger.seconds * 1000).toLocaleTimeString()
                        : "Por definir"
                }</p>
                <p><strong>Estado:</strong> ${
                    pedido.estado_pedido || "Pendiente de actualización"
                }</p>
            `;

            pedidosContainer.appendChild(pedidoElement);
        });
    } catch (error) {
        console.error("Error al cargar los pedidos:", error);
        pedidosContainer.innerHTML = "<p>Error al cargar los pedidos.</p>";
    }
}

// Cargar los pedidos al cargar la página
document.addEventListener("DOMContentLoaded", cargarPedidos);

