let slideIndex = 0;
const slides = document.querySelectorAll(".slide");

function showSlides() {
    slides.forEach((slide, index) => {
        slide.style.opacity = (index === slideIndex) ? 1 : 0;
    });
    slideIndex = (slideIndex + 1) % slides.length;
}

// Cambia de imagen cada 5 segundos
setInterval(showSlides, 5000);
