import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    limit, 
    setDoc, 
    doc, 
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


// Configuración Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIutw__qzk2i31w6eo4mSL6xQl3fg6avU",
    authDomain: "cafeteria-ujat-eb2b0.firebaseapp.com",
    projectId: "cafeteria-ujat-eb2b0",
    storageBucket: "cafeteria-ujat-eb2b0.firebasestorage.app",
    messagingSenderId: "269489762867",
    appId: "1:269489762867:web:4f228461f6c4a122afa946",
    measurementId: "G-S6L7HNSX72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias
const formProducto = document.getElementById("formProducto");
const nombreProducto = document.getElementById("nombreProducto");
const descripcionProducto = document.getElementById("descripcionProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const precioProducto = document.getElementById("precioProducto");
const productosRef = collection(db, "Productos");
const inventarioRef = collection(db, "Inventario");
const reportesRef = collection(db, "Reportes de venta");
const listaProductos = document.getElementById("listaProductos");
const listaInventario = document.getElementById("listaInventario");
const listaReportes = document.getElementById("listaReportes");

// Función para obtener el siguiente ID
async function obtenerSiguienteId() {
    try {
        const q = query(productosRef, orderBy("id_productos", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const ultimoProducto = snapshot.docs[0].data();
            return parseInt(ultimoProducto.id_productos) + 1;
        } else {
            return 1; // Si no hay productos, el ID inicial será 1
        }
    } catch (error) {
        console.error("Error al obtener el siguiente ID:", error);
        return 1;
    }
}

// Función para cargar productos e inventario
async function cargarProductosEInventario() {
    const tablaCuerpo = document.querySelector("#tablaInventario tbody");
    const productosSinStock = document.getElementById("productosSinStock");

    tablaCuerpo.innerHTML = ""; // Limpiar tabla
    productosSinStock.innerHTML = ""; // Limpiar lista de productos sin stock

    try {
        const productosSnapshot = await getDocs(productosRef);
        const inventarioSnapshot = await getDocs(inventarioRef);

        const inventarioMap = {};
        inventarioSnapshot.forEach((doc) => {
            const inventario = doc.data();
            inventarioMap[inventario.id_producto] = inventario.cantidad;
        });

        productosSnapshot.forEach((doc, index) => {
            const producto = doc.data();
            const cantidad = inventarioMap[producto.id_productos] || 0;

            // Crear fila para la tabla
            const fila = document.createElement("tr");

            fila.innerHTML = `
                 <td>${producto.id_productos}</td>
                <td>${producto.nombre}</td>
                <td>${cantidad}</td>
                <td>
                    <button class="edit" onclick="editarProducto('${producto.id_productos}', ${cantidad})">Editar</button>
                    <button class="delete" onclick="eliminarProducto('${producto.id_productos}')">Eliminar</button>
                </td>
            `;
            tablaCuerpo.appendChild(fila);

            // Si no hay stock, añadir a la lista de productos sin stock
            if (cantidad === 0) {
                const liSinStock = document.createElement("li");
                liSinStock.textContent = `${producto.nombre} (ID: ${producto.id_productos}) está sin stock.`;
                productosSinStock.appendChild(liSinStock);
            }
        });
    } catch (error) {
        console.error("Error al cargar productos e inventario:", error);
    }
}



// Función para añadir un producto
formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoNombre = nombreProducto.value.trim();
    const nuevaDescripcion = descripcionProducto.value.trim();
    const nuevaCategoria = categoriaProducto.value;
    const nuevoPrecio = parseFloat(precioProducto.value);

    if (!nuevoNombre || !nuevaDescripcion || !nuevaCategoria || isNaN(nuevoPrecio)) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const nuevoId = await obtenerSiguienteId();

        // Añadir producto
        await setDoc(doc(db, "Productos", nuevoId.toString()), {
            descripción: nuevaDescripcion,
            id_categoria: nuevaCategoria,
            id_productos: nuevoId,
            nombre: nuevoNombre,
            precio: nuevoPrecio
        });

        // Crear inventario inicial
        await setDoc(doc(db, "Inventario", nuevoId.toString()), {
            id_producto: nuevoId,
            cantidad: 0
        });

        alert("Producto añadido con éxito.");
        formProducto.reset();
        cargarProductosEInventario();
    } catch (error) {
        console.error("Error al añadir producto:", error);
        alert("Hubo un error al añadir el producto.");
    }
});


// Función para editar un producto
window.editarProducto = async function (idProducto, cantidadActual) {
    const nuevaCantidad = parseInt(prompt("Nueva cantidad:", cantidadActual));
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

    try {
        await setDoc(doc(db, "Inventario", idProducto), {
            cantidad: nuevaCantidad
        }, { merge: true });

        alert("Producto actualizado con éxito.");
        cargarProductosEInventario();
    } catch (error) {
        console.error("Error al editar producto:", error);
        alert("Hubo un error al actualizar el producto.");
    }
};

// Función para eliminar un producto
window.eliminarProducto = async function (idProducto) {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        return;
    }

    try {
        await deleteDoc(doc(db, "Productos", idProducto));
        await deleteDoc(doc(db, "Inventario", idProducto));

        alert("Producto eliminado con éxito.");
        cargarProductosEInventario();
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Hubo un error al eliminar el producto.");
    }
};
// Inicializar
cargarProductosEInventario();




// Cargar Reportes de Ventas
async function cargarReportes() {
    listaReportes.innerHTML = "";
    const reportesSnapshot = await getDocs(reportesRef);

    for (const doc of reportesSnapshot.docs) {
        const reporte = doc.data();

        // Formatear productos vendidos
        const productosVendidos = Object.entries(reporte.mas_vendido || {})
            .map(([nombreProducto, cantidad]) => `${nombreProducto}: ${cantidad}`)
            .join(", ");
        // Crear elemento de lista
        const li = document.createElement("li");
        li.textContent = `ID Reporte: ${reporte.id_reporte} -Fecha: ${new Date(reporte.fecha.seconds * 1000).toLocaleDateString()} - Ventas Totales: $${reporte.ventas_totales.toFixed(2)} - Cantidad Total Vendida: ${reporte.cantidad_vendida} - Productos Vendidos: ${productosVendidos}`;
        listaReportes.appendChild(li);
    }
}


// Función para cargar el inventario
async function cargarInventario() {
    listaInventario.innerHTML = ""; // Limpiar lista de inventario

    try {
        // Obtener todos los documentos de la colección Inventario
        const inventarioSnapshot = await getDocs(inventarioRef);

        inventarioSnapshot.forEach((doc) => {
            const inventario = doc.data();

            // Crear elemento de lista para cada entrada en el inventario
            const li = document.createElement("li");
            li.textContent = `ID Producto: ${inventario.id_producto}, Cantidad: ${inventario.cantidad}, Reposición: ${inventario.reposicion ? 'Sí' : 'No'}`;
            listaInventario.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar el inventario:", error);
    }
}


async function sincronizarInventario() {
    try {
        const productosSnapshot = await getDocs(productosRef);
        const inventarioSnapshot = await getDocs(inventarioRef);

        const inventarioIds = new Set();
        inventarioSnapshot.forEach((doc) => inventarioIds.add(doc.data().id_producto));

        productosSnapshot.forEach(async (productoDoc) => {
            const producto = productoDoc.data();
            if (!inventarioIds.has(producto.id_productos)) {
                // Crear una entrada en el inventario si no existe
                await setDoc(doc(db, "Inventario", producto.id_productos.toString()), {
                    id_producto: producto.id_productos,
                    cantidad: 0
                });
                console.log(`Entrada de inventario creada para ID Producto: ${producto.id_productos}`);
            }
        });

        alert("Sincronización de inventario completada.");
        cargarProductosEInventario(); // Recargar datos
    } catch (error) {
        console.error("Error al sincronizar inventario:", error);
        alert("Hubo un error al sincronizar el inventario.");
    }
}


// Llamar a la función para inicializar los datos
cargarReportes();
cargarInventario();
sincronizarInventario();


const userIcon = document.getElementById('userIcon');
const userDropdown = document.getElementById('userDropdown');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Mostrar/ocultar el menú de usuario
userIcon.addEventListener('click', () => {
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
});

// Cerrar sesión
btnCerrarSesion.addEventListener('click', () => {
    localStorage.removeItem('sesionActiva');
    alert('Sesión cerrada.');
    window.location.href = 'login.html';
});


// Menú responsive
const menu = document.querySelector('.menu');
const toggleMenu = document.querySelector('.fa-bars');

toggleMenu.addEventListener('click', () => {
    menu.classList.toggle('show');
});