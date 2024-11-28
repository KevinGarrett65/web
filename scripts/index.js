// Elementos del DOM para la sesión de usuario
const btnIniciarSesion = document.getElementById('btnIniciarSesion'); // Botón para "Iniciar Sesión"
const mensajeBienvenida = document.getElementById('mensajeBienvenida'); // Mensaje de bienvenida
const containerCerrarSesion = document.getElementById('containerCerrarSesion'); // Contenedor para el botón "Cerrar sesión"
const btnCerrarSesion = document.getElementById('btnCerrarSesion'); // Botón de "Cerrar sesión"

// Cargar la sesión activa
const sesion = JSON.parse(localStorage.getItem('sesionActiva'));

// Revisar si la sesión tiene un "nombre" en lugar de "username"
if (sesion && sesion.nombre) {
    mostrarSesionIniciada(sesion.nombre);
} else {
    mostrarBotonIniciarSesion();
}

function mostrarSesionIniciada(nombre) {
    // Mostrar mensaje de bienvenida
    mensajeBienvenida.textContent = `¡Hola, ${nombre}!`;
    mensajeBienvenida.style.display = 'inline-block';

    // Ocultar botón de iniciar sesión y mostrar el contenedor de cerrar sesión
    btnIniciarSesion.style.display = 'none';
    containerCerrarSesion.style.display = 'inline-block';
}

function mostrarBotonIniciarSesion() {
    // Mostrar el botón de iniciar sesión y ocultar el de cerrar sesión
    btnIniciarSesion.style.display = 'inline-block';
    containerCerrarSesion.style.display = 'none';

    // Redirigir al login cuando se hace clic en iniciar sesión
    btnIniciarSesion.addEventListener('click', function () {
        window.location.href = 'login.html';
    });
}

function cerrarSesion() {
    // Eliminar la sesión activa
    localStorage.removeItem('sesionActiva');
    alert('Has cerrado sesión.');

    // Redirigir al login
    window.location.href = 'login.html';
}

// Agregar el evento de cerrar sesión al botón
btnCerrarSesion.addEventListener('click', cerrarSesion);

// Carrito de compras
const botonesAñadirCarrito = document.querySelectorAll('.btn-add');
const carritoLista = document.getElementById('carrito-lista');
const numeroCarrito = document.querySelector('.content-shopping-cart .number');

// Array para almacenar los productos en el carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Elementos del DOM para el modal del carrito
const modalCarrito = document.getElementById('modalCarrito');
const cerrarModalCarrito = modalCarrito.querySelector('.cerrar');
const listaProductosCarrito = document.getElementById('listaProductosCarrito');
const iconoCarrito = document.querySelector('.fa-basket-shopping');
const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');

// Abrir el modal del carrito
iconoCarrito.addEventListener('click', () => {
    modalCarrito.style.display = 'block';
    mostrarProductosEnCarrito();
});

// Cerrar el modal del carrito
cerrarModalCarrito.addEventListener('click', () => {
    modalCarrito.style.display = 'none';
});

// Cerrar el modal si se hace clic fuera de él
window.addEventListener('click', (e) => {
    if (e.target == modalCarrito) {
        modalCarrito.style.display = 'none';
    }
});

// Mostrar productos en el modal del carrito
function mostrarProductosEnCarrito() {
    listaProductosCarrito.innerHTML = ''; // Limpiar lista antes de actualizar
    carrito.forEach((producto) => {
        const li = document.createElement('li');
        li.textContent = `${producto.nombre} - ${producto.cantidad} x $${producto.precio.toFixed(2)}`;
        listaProductosCarrito.appendChild(li);
    });
}

// Función para vaciar el carrito
btnVaciarCarrito.addEventListener('click', () => {
    carrito = [];
    actualizarCarrito();
    modalCarrito.style.display = 'none';
    alert('El carrito ha sido vaciado.');
});

// Función para Comprar
document.getElementById("btnComprarCarrito").addEventListener("click", () => {
    const sesion = JSON.parse(localStorage.getItem("sesionActiva"));

    if (!sesion || !sesion.nombre) {
        alert("Debes iniciar sesión para realizar la compra.");
        window.location.href = "login.html"; // Redirigir al login si no está logueado
        return;
    }

    if (carrito.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de continuar.");
        return;
    }

    // Si el usuario está logueado y hay productos en el carrito, redirige a la página de compra
    window.location.href = "compra.html";
});

// Modificar la función actualizarCarrito para que funcione con el modal
function actualizarCarrito() {
    // Actualizar la visualización de la lista
    mostrarProductosEnCarrito();

    // Actualizar el número de productos en el carrito en el icono
    const totalProductos = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    numeroCarrito.textContent = `(${totalProductos})`;

    // Guardar el carrito en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Evento para añadir productos al carrito
botonesAñadirCarrito.forEach(boton => {
    boton.addEventListener('click', agregarAlCarrito);
});

// Función para agregar el producto al carrito
function agregarAlCarrito(e) {
    const producto = e.target.closest('.card-product');
    const idProducto = producto.getAttribute('data-id');
    const nombreProducto = producto.getAttribute('data-name');
    const precioProducto = producto.getAttribute('data-price');

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(prod => prod.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        // Añadir nuevo producto al carrito
        carrito.push({
            id: idProducto,
            nombre: nombreProducto,
            precio: parseFloat(precioProducto),
            cantidad: 1
        });
    }

    // Actualizar el carrito en la interfaz
    actualizarCarrito();
}

// Inicializar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', actualizarCarrito);


let slideIndex = 0;
const slides = document.querySelectorAll(".slide");

function showSlides() {
    slides.forEach((slide, index) => {
        slide.style.opacity = (index === slideIndex) ? 1 : 0;
    });
    slideIndex = (slideIndex + 1) % slides.length;
}

// Cambia de imagen cada 3 segundos
setInterval(showSlides, 3000);

// Elemento de la barra de búsqueda
const searchInput = document.querySelector('.search-form input');
const searchButton = document.querySelector('.btn-search');

// Función para redirigir al menú con el término buscado
function redirigirAlMenuConBusqueda(término) {
    // Guardar el término en localStorage para pasarlo al menú
    localStorage.setItem('terminoBusqueda', término);

    // Redirigir a menu.html
    window.location.href = 'menu.html';
}

// Evento para detectar clic en el botón de búsqueda
searchButton.addEventListener('click', (e) => {
    e.preventDefault(); // Evita el envío del formulario
    const término = searchInput.value.trim();
    if (término) {
        redirigirAlMenuConBusqueda(término);
    }
});

// Botones de categorías
const btnAlimentos = document.querySelector('.category-antojitos');
const btnBebidas = document.querySelector('.category-taco');
const btnCombos = document.querySelector('.category-promo');

// Función para redirigir al menú con la categoría seleccionada
function redirigirConCategoria(idCategoria) {
    localStorage.setItem('categoriaSeleccionada', idCategoria);
    window.location.href = 'menu.html';
}

// Agregar eventos a los botones de categorías
btnAlimentos.addEventListener('click', () => redirigirConCategoria('A01')); // Alimentos
btnBebidas.addEventListener('click', () => redirigirConCategoria('B02')); // Bebidas
btnCombos.addEventListener('click', () => redirigirConCategoria('C03')); // Combos


// Referencias al DOM
const userIcon = document.querySelector('.user-icon');
const userDropdown = document.getElementById('userDropdown');
const btnCerrarSesionDropdown = document.getElementById('btnCerrarSesionDropdown');

// Mostrar/Ocultar el menú desplegable
userIcon.addEventListener('click', () => {
    const isDropdownVisible = userDropdown.style.display === 'block';
    userDropdown.style.display = isDropdownVisible ? 'none' : 'block';
});

// Cerrar sesión desde el menú desplegable
btnCerrarSesionDropdown.addEventListener('click', cerrarSesion);

// Cerrar el menú desplegable al hacer clic fuera
window.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && !userIcon.contains(e.target)) {
        userDropdown.style.display = 'none';
    }
});
