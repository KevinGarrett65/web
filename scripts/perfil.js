// Ejecutar el código solo cuando el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Cargar la sesión activa
    const sesionActiva = JSON.parse(localStorage.getItem('sesionActiva'));

    // Verificar si hay sesión activa
    if (sesionActiva) {
        // Extraer los datos del usuario guardados en `sesionActiva`
        const { matricula, nombre, apellidoPaterno, apellidoMaterno, tipoUsuario, carrera } = sesionActiva;

        // Seleccionar los elementos por ID y actualizar su contenido
        document.getElementById('nombreUsuario').textContent = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`;
        document.getElementById('tipoUsuario').textContent = tipoUsuario || 'Tipo de Usuario'; // Ejemplo: Alumno, Profesor
        document.getElementById('carreraUsuario').textContent = carrera || 'ISC';
        document.getElementById('correoUsuario').textContent = `@${matricula}`; // Usando la matrícula como identificador único
    } else {
        // Si no hay sesión activa, redirigir al login
        window.location.href = 'login.html';
    }

    // Función para cerrar el perfil sin cerrar sesión
    document.getElementById('btnCerrarPerfil').addEventListener('click', () => {
        // Redirige a la página principal
        window.location.href = 'index.html';
    });
});
