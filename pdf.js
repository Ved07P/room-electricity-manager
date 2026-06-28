document.getElementById('generate-pdf-btn').addEventListener('click', async function() {
    // Ensure latest data is saved before generating
    captureCurrentRoomData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));

    const btn = this;
    const originalText = btn.innerText;
    btn.innerText = "Generating PDF...";
    btn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4'); 
        
        const templateContainer = document.getElementById('pdf-container');
        const pdfPage = document.getElementById('pdf-page');
        const pdfRoomTitle = document.getElementById('pdf-room-title');
        const pdfDate = document.getElementById('pdf-date');
        const pdfTbody = document.getElementById('pdf-tbody');
        const pdfBill = document.getElementById('pdf-bill');
        const pdfPageNum = document.getElementById('pdf-page-num');

        // Bring template on screen but hidden behind rendering context to allow html2canvas to read it
        templateContainer.style.top = '0';
        templateContainer.style.left = '0';
        templateContainer.style.zIndex = '-9999';

        const currentDate = new Date().toLocaleString();

        for (let i = 0; i < ROOMS.length; i++) {
            const room = ROOMS[i];
            const data = appData[room];

            // Populate Template
            pdfRoomTitle.innerText = `Room ${room}`;
            pdfDate.innerText = `Generated on: ${currentDate}`;
            pdfPageNum.innerText = `Page ${i + 1} of 10`;
            pdfBill.innerText = `Average Monthly Electricity Bill: ₹${data.bill || '0'}`;

            pdfTbody.innerHTML = '';
            APPLIANCES.forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${app}</td>
                    <td>${data[app].quantity || '0'}</td>
                    <td>${data[app].star || '0'}</td>
                    <td>${data[app].hours || '0'}</td>
                `;
                pdfTbody.appendChild(tr);
            });

            // Capture via html2canvas
            const canvas = await html2canvas(pdfPage, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Add new page if not the last room
            if (i < ROOMS.length - 1) {
                pdf.addPage();
            }
        }

        // Save PDF
        pdf.save('Room_Electricity_Report.pdf');

        // Hide template again
        templateContainer.style.top = '-9999px';
        templateContainer.style.left = '-9999px';

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("An error occurred while generating the PDF.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
