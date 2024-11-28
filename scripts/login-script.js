// login-script.js

// Obtener elementos del DOM
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const abrirModalRegistro = document.getElementById('abrirModalRegistro');
const modalRegistro = document.getElementById('modalRegistro');
const cerrarModal = document.querySelector('.cerrar');

// Importar y configurar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIutw__qzk2i31w6eo4mSL6xQl3fg6avU",
    authDomain: "cafeteria-ujat-eb2b0.firebaseapp.com",
    projectId: "cafeteria-ujat-eb2b0",
    storageBucket: "cafeteria-ujat-eb2b0.firebasestorage.app",
    messagingSenderId: "269489762867",
    appId: "1:269489762867:web:4f228461f6c4a122afa946",
    measurementId: "G-S6L7HNSX72"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mostrar el modal de registro
abrirModalRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    modalRegistro.style.display = 'block';
});

// Cerrar el modal de registro
cerrarModal.addEventListener('click', () => {
    modalRegistro.style.display = 'none';
});

// Cerrar el modal si se hace clic fuera del contenido del modal
window.addEventListener('click', (e) => {
    if (e.target == modalRegistro) {
        modalRegistro.style.display = 'none';
    }
});

// Función para registrar un nuevo usuario en Firestore
formRegistro.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Obtener valores de los campos del formulario
    const matricula = document.getElementById('matricula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellidoPaterno = document.getElementById('apellidoPaterno').value.trim();
    const apellidoMaterno = document.getElementById('apellidoMaterno').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const password = document.getElementById('nuevo-password').value.trim();

    // Verificar si algún campo está vacío
    if (!matricula || !nombre || !apellidoPaterno || !apellidoMaterno || !correo || !tipoUsuario || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        // Registrar al usuario en Firestore
        await setDoc(doc(db, "Usuarios", matricula), {
            ap_materno: apellidoMaterno,
            ap_paterno: apellidoPaterno,
            correo: correo,
            id_tipo_usuario: tipoUsuario,
            id_usuario: matricula,
            nombre: nombre,
            password: password
        });
        
        alert('Usuario registrado con éxito.');

        // Limpiar el formulario y cerrar el modal
        formRegistro.reset();
        modalRegistro.style.display = 'none';
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert('Hubo un error al registrar al usuario.');
    }
});

// Función para iniciar sesión
formLogin.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === '' || password === '') {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        const docRef = doc(db, "Usuarios", username);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().password === password) {
            const userData = docSnap.data();
            alert('Inicio de sesión exitoso.');

            // Guardar la sesión en localStorage
            localStorage.setItem('sesionActiva', JSON.stringify(userData));

            // Redirigir según el tipo de usuario
            if (userData.id_tipo_usuario === 'empleado') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert('Hubo un error al iniciar sesión.');
    }
});
