function HTMLtoPDF() {
    const { jsPDF } = window.jspdf;
    const source = document.getElementById("HTMLtoPDF");

    html2canvas(source, {
        scale: 2, // Aumenta la resolución
        useCORS: true, // Permite cargar imágenes externas
    }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("Ticket.pdf");
    });
}

