// Optimized PDF Generation using jsPDF and autoTable (No full page images)
document.getElementById('generatePdfBtn').addEventListener('click', async () => {
    if (rooms.length === 0) {
        alert("No rooms available to generate PDF.");
        return;
    }

    // Access jsPDF from CDN window object
    const { jsPDF } = window.jspdf;
    
    // Initialize Document
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Notify user
    const originalText = document.getElementById('generatePdfBtn').innerHTML;
    document.getElementById('generatePdfBtn').innerHTML = "⏳ Generating...";
    
    // Allow UI to update before heavy processing
    setTimeout(() => {
        try {
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            const margin = 40;
            const today = new Date().toLocaleDateString();

            rooms.forEach((room, index) => {
                if (index > 0) {
                    doc.addPage();
                }

                // Header
                doc.setFontSize(22);
                doc.setTextColor(49, 130, 206); // Primary Color
                doc.text("Room Electricity Manager", pageWidth / 2, margin, { align: "center" });
                
                doc.setFontSize(16);
                doc.setTextColor(45, 55, 72);
                doc.text(`Room: ${room.name}`, margin, margin + 40);

                // Status tag
                const status = room.completed ? "Status: Completed" : "Status: Pending";
                doc.setFontSize(12);
                doc.setTextColor(room.completed ? 56 : 214, room.completed ? 161 : 158, room.completed ? 105 : 46);
                doc.text(status, pageWidth - margin, margin + 40, { align: "right" });

                // Prepare Table Data
                const tableBody = APPLIANCES.map(app => {
                    const data = room.appliances[app] || {};
                    return [
                        app,
                        data.quantity || '0',
                        data.star || '0',
                        data.hours || '0'
                    ];
                });

                // Draw Table using AutoTable plugin
                doc.autoTable({
                    startY: margin + 60,
                    head: [['Appliance', 'Quantity', 'Star Rating', 'Hours/Day']],
                    body: tableBody,
                    theme: 'grid',
                    headStyles: { fillColor: [49, 130, 206], textColor: 255 },
                    styles: { fontSize: 10, cellPadding: 6 },
                    alternateRowStyles: { fillColor: [247, 250, 252] },
                    margin: { left: margin, right: margin }
                });

                // Bill Section below table
                const finalY = doc.lastAutoTable.finalY + 30;
                doc.setFontSize(14);
                doc.setTextColor(45, 55, 72);
                doc.text(`Average Monthly Electricity Bill: Rs. ${room.bill || '0'}`, margin, finalY);

                // Footer
                doc.setFontSize(10);
                doc.setTextColor(160, 174, 192);
                doc.text(`Generated on: ${today}`, margin, pageHeight - margin);
                doc.text(`Page ${index + 1} of ${rooms.length}`, pageWidth - margin, pageHeight - margin, { align: "right" });
            });

            // Save PDF
            doc.save('Room_Electricity_Report.pdf');
            
        } catch (error) {
            console.error(error);
            alert("An error occurred while generating PDF.");
        } finally {
            // Restore button text
            document.getElementById('generatePdfBtn').innerHTML = originalText;
        }
    }, 100);
});

