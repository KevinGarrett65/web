import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// Elementos del DOM
const mostrador = document.getElementById("mostrador");
const seleccion = document.getElementById("seleccion");
const imgSeleccionada = document.getElementById("img");
const modeloSeleccionado = document.getElementById("modelo");
const descripSeleccionada = document.getElementById("descripcion");
const precioSeleccionado = document.getElementById("precio");
const listaProductosCarrito = document.getElementById("listaProductosCarrito");
const numeroCarrito = document.querySelector(".content-shopping-cart .number");
const modalCarrito = document.getElementById("modalCarrito");
const iconoCarrito = document.querySelector(".fa-basket-shopping");
const cerrarModalCarrito = document.querySelector(".cerrar");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");

// Elementos de sesión
const btnIniciarSesion = document.getElementById('btnIniciarSesion');
const mensajeBienvenida = document.getElementById('mensajeBienvenida');
const containerCerrarSesion = document.getElementById('containerCerrarSesion');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Carrito de compras
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Función para manejar la compra al hacer clic en "Comprar"
document.getElementById("btnComprarCarrito").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de continuar.");
        return;
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.location.href = "compra.html";
});

// Función para cargar productos desde Firestore
async function mostrarProductos() {
    try {
        const productosCollection = collection(db, "Productos");
        const productosSnapshot = await getDocs(productosCollection);
        const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        mostrador.innerHTML = "";
        let fila;

        productos.forEach((producto, index) => {
            if (index % 4 === 0) {
                fila = document.createElement("div");
                fila.classList.add("fila");
                mostrador.appendChild(fila);
            }

            const imagen = getImageForProduct(producto.nombre);
            const descripcion = producto.descripción || "Sin descripción";

            const itemHTML = `
                <div class="item" onclick="cargar(this)" 
                    data-nombre="${producto.nombre}" 
                    data-descripcion="${descripcion}" 
                    data-precio="${producto.precio}" 
                    data-imagen="${imagen}">
                    <div class="contenedor-foto">
                        <img src="${imagen}" alt="${producto.nombre}">
                    </div>
                    <p class="descripcion">${producto.nombre}</p>
                    <span class="precio">$${producto.precio}</span>
                </div>
            `;
            fila.insertAdjacentHTML("beforeend", itemHTML);
        });
    } catch (error) {
        console.error("Error al cargar productos desde Firestore:", error);
    }
}

// Función para asignar imágenes según el nombre del producto
function getImageForProduct(nombre) {
    const images = {
        "Agua de jamaica": "img/Agua de jamaica.png",
        "Coca cola": "img/Coca cola.png",
        "Empanada": "img/empanada.png",
        "Torta de pastor": "img/Torta de pastor.png",
        "Orden de pastor": "img/Orden de pastor.png",
        "Hot dogs": "img/Hot dogs.png",
        "Pizza": "img/Pizza.png",
        "Banderilla": "img/Banderilla.jpeg",
        "Pepsi": "img/Pepsi.png",
        "Chocomilk": "img/Chocomilk.png",
        "Tlayuda": "img/Tlayuda.png",
        "Hamburguesa": "img/Hamburguesa.png",
        "Orden de asada": "img/Orden de asada.png",
        "Torta de milanesa": "img/Torta de milanesa.png",
        "Torta de asada": "img/Torta de asada.png",
        "Orden de tacos campechanos": "img/Orden de tacos campechanos.png"
    };
    return images[nombre] || "img/default.png";
}

// Función para mostrar el producto seleccionado
window.cargar = function (item) {
    imgSeleccionada.src = item.getAttribute("data-imagen");
    modeloSeleccionado.textContent = item.getAttribute("data-nombre");
    descripSeleccionada.textContent = item.getAttribute("data-descripcion");
    precioSeleccionado.textContent = `$${item.getAttribute("data-precio")}`;
    seleccion.style.width = "40%";
    seleccion.style.opacity = "1";
};

// Función para cerrar la selección
window.cerrar = function () {
    seleccion.style.width = "0";
    seleccion.style.opacity = "0";
};

// Función para agregar productos al carrito
window.agregarAlCarrito = async function () {
    const sesion = JSON.parse(localStorage.getItem('sesionActiva'));

    if (!sesion || !sesion.nombre) {
        alert("Debes iniciar sesión para añadir productos al carrito.");
        return; // Detener la ejecución si no hay sesión activa
    }

    const nombreProducto = modeloSeleccionado.textContent;
    const precioProducto = parseFloat(precioSeleccionado.textContent.replace("$", "").trim());
    const cantidadProducto = parseInt(document.getElementById("product-quantity").value);

    try {
        // Buscar el producto en la colección 'Productos' para obtener el id_producto
        const productoRef = collection(db, "Productos");
        const q = query(productoRef, where("nombre", "==", nombreProducto));
        const productoSnapshot = await getDocs(q);

        if (productoSnapshot.empty) {
            alert(`El producto "${nombreProducto}" no existe en la base de datos.`);
            return;
        }

        // Suponiendo que el nombre es único, obtenemos el primer documento
        const productoData = productoSnapshot.docs[0].data();
        const idProducto = productoData.id_productos; // El id_producto del documento

        // Buscar si el producto ya está en el carrito
        const productoExistente = carrito.find(prod => prod.id_producto === idProducto);

        if (productoExistente) {
            // Si el producto ya existe en el carrito, incrementamos la cantidad
            productoExistente.cantidad += cantidadProducto;
        } else {
            // Si el producto no existe en el carrito, lo añadimos
            carrito.push({
                id_producto: idProducto,
                nombre: nombreProducto,
                precio: precioProducto,
                cantidad: cantidadProducto
            });
        }

        // Guardar el carrito actualizado en localStorage
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarCarrito();
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        alert("Hubo un problema al agregar el producto al carrito. Inténtalo de nuevo.");
    }
};

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    listaProductosCarrito.innerHTML = "";
    carrito.forEach(producto => {
        const li = document.createElement("li");
        li.textContent = `${producto.nombre} - ${producto.cantidad} x $${producto.precio.toFixed(2)}`;
        listaProductosCarrito.appendChild(li);
    });

    const totalProductos = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    numeroCarrito.textContent = `(${totalProductos})`;

    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ---- Funciones para botones de cantidad ----
window.decreaseQuantity = function () {
    const input = document.getElementById("product-quantity");
    const currentValue = parseInt(input.value);
    if (currentValue > 1) {
        input.value = currentValue - 1;
    } else {
        alert("La cantidad no puede ser menor a 1.");
    }
};

window.increaseQuantity = function () {
    const input = document.getElementById("product-quantity");
    const currentValue = parseInt(input.value);
    input.value = currentValue + 1;
};

// Mostrar el carrito al hacer clic en el ícono
iconoCarrito.addEventListener("click", () => {
    modalCarrito.style.display = "block";
    mostrarProductosEnCarrito();
});

// Cerrar el modal del carrito
cerrarModalCarrito.addEventListener("click", () => {
    modalCarrito.style.display = "none";
});

// Mostrar productos en el modal del carrito
function mostrarProductosEnCarrito() {
    listaProductosCarrito.innerHTML = "";
    if (carrito.length === 0) {
        listaProductosCarrito.innerHTML = "<li>El carrito está vacío.</li>";
    } else {
        carrito.forEach((producto) => {
            const li = document.createElement("li");
            li.textContent = `${producto.nombre} - ${producto.cantidad} x $${producto.precio.toFixed(2)}`;
            listaProductosCarrito.appendChild(li);
        });
    }
}

// Función para vaciar el carrito
btnVaciarCarrito.addEventListener("click", () => {
    carrito = [];
    actualizarCarrito();
    modalCarrito.style.display = "none";
    alert("El carrito ha sido vaciado.");
});


// Función para comprar el carrito
document.getElementById("btnComprarCarrito").addEventListener("click", () => {
    const sesion = JSON.parse(localStorage.getItem('sesionActiva'));

    if (!sesion || !sesion.nombre) {
        alert("Debes iniciar sesión para realizar la compra.");
        window.location.href = "login.html"; // Redirigir al login
        return;
    }

    if (carrito.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de continuar.");
        return;
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.location.href = "compra.html"; // Redirigir a la página de compra
});


// ---- Manejo de sesión ----
const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
if (sesion && sesion.nombre) {
    mostrarSesionIniciada(sesion.nombre);
} else {
    mostrarBotonIniciarSesion();
}

function mostrarSesionIniciada(nombre) {
    mensajeBienvenida.textContent = `¡Hola, ${nombre}!`;
    mensajeBienvenida.style.display = 'inline-block';
    btnIniciarSesion.style.display = 'none';
    containerCerrarSesion.style.display = 'inline-block';
}

function mostrarBotonIniciarSesion() {
    btnIniciarSesion.style.display = 'inline-block';
    containerCerrarSesion.style.display = 'none';
    btnIniciarSesion.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

btnCerrarSesion.addEventListener('click', () => {
    localStorage.removeItem('sesionActiva');
    alert('Has cerrado sesión.');
    window.location.href = 'login.html';
});

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    mostrarProductos();
    actualizarCarrito();
});

// Elemento de la barra de búsqueda
const searchInput = document.querySelector('.search-form input');

// Función para filtrar productos según la búsqueda
async function filtrarProductos(término) {
    try {
        const productosCollection = collection(db, "Productos");
        const productosSnapshot = await getDocs(productosCollection);
        const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        mostrador.innerHTML = "";
        let fila;

        const productosFiltrados = productos.filter(producto => 
            producto.nombre.toLowerCase().includes(término.toLowerCase())
        );

        productosFiltrados.forEach((producto, index) => {
            if (index % 4 === 0) {
                fila = document.createElement("div");
                fila.classList.add("fila");
                mostrador.appendChild(fila);
            }

            const imagen = getImageForProduct(producto.nombre);
            const descripcion = producto.descripción || "Sin descripción";

            const itemHTML = `
                <div class="item" onclick="cargar(this)" 
                    data-nombre="${producto.nombre}" 
                    data-descripcion="${descripcion}" 
                    data-precio="${producto.precio}" 
                    data-imagen="${imagen}">
                    <div class="contenedor-foto">
                        <img src="${imagen}" alt="${producto.nombre}">
                    </div>
                    <p class="descripcion">${producto.nombre}</p>
                    <span class="precio">$${producto.precio}</span>
                </div>
            `;
            fila.insertAdjacentHTML("beforeend", itemHTML);
        });

        if (productosFiltrados.length === 0) {
            mostrador.innerHTML = "<p>No se encontraron productos con ese término.</p>";
        }
    } catch (error) {
        console.error("Error al filtrar productos:", error);
    }
}

// Evento para detectar cambios en la barra de búsqueda
searchInput.addEventListener('input', (e) => {
    const término = e.target.value;
    filtrarProductos(término);
});

document.addEventListener('DOMContentLoaded', () => {
    const términoBusqueda = localStorage.getItem('terminoBusqueda');
    if (términoBusqueda) {
        // Realizar la búsqueda automáticamente si hay un término
        filtrarProductos(términoBusqueda);
        localStorage.removeItem('terminoBusqueda'); // Limpiar el término después de usarlo
    } else {
        // Mostrar todos los productos si no hay término
        mostrarProductos();
    }
    actualizarCarrito();
});

// Función para actualizar el mostrador con productos
function actualizarMostrador(productos) {
    mostrador.innerHTML = ""; // Limpiar el mostrador
    let fila;

    productos.forEach((producto, index) => {
        if (index % 4 === 0) {
            fila = document.createElement("div");
            fila.classList.add("fila");
            mostrador.appendChild(fila);
        }

        const imagen = getImageForProduct(producto.nombre);
        const descripcion = producto.descripción || "Sin descripción";

        const itemHTML = `
            <div class="item" onclick="cargar(this)" 
                data-nombre="${producto.nombre}" 
                data-descripcion="${descripcion}" 
                data-precio="${producto.precio}" 
                data-imagen="${imagen}">
                <div class="contenedor-foto">
                    <img src="${imagen}" alt="${producto.nombre}">
                </div>
                <p class="descripcion">${producto.nombre}</p>
                <span class="precio">$${producto.precio}</span>
            </div>
        `;
        fila.insertAdjacentHTML("beforeend", itemHTML);
    });

    if (productos.length === 0) {
        mostrador.innerHTML = "<p>No se encontraron productos en esta categoría.</p>";
    }
}

// Función para filtrar productos por categoría
async function filtrarPorCategoria(idCategoria) {
    try {
        const productosCollection = collection(db, "Productos");
        const productosSnapshot = await getDocs(productosCollection);
        const productos = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrar productos por categoría
        const productosFiltrados = productos.filter(producto => producto.id_categoria === idCategoria);

        // Actualizar mostrador con productos filtrados
        actualizarMostrador(productosFiltrados);
    } catch (error) {
        console.error("Error al filtrar productos por categoría:", error);
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const idCategoria = localStorage.getItem('categoriaSeleccionada');
    if (idCategoria) {
        filtrarPorCategoria(idCategoria); // Filtrar por categoría seleccionada
        localStorage.removeItem('categoriaSeleccionada'); // Limpiar la categoría después de usarla
    } else {
        console.error("No se encontró una categoría seleccionada en localStorage.");
    }
});

document.getElementById("categoryFilter").addEventListener("change", (event) => {
    const categoriaSeleccionada = event.target.value;
    if (categoriaSeleccionada === "Todos") {
        mostrarProductos(); // Mostrar todos los productos
    } else {
        filtrarPorCategoria(categoriaSeleccionada); // Función existente para filtrar por ID de categoría
    }
});
