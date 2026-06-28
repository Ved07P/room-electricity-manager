# Room Electricity Manager ⚡

A complete, professional, and mobile-friendly web application for managing electricity appliance data across 10 distinct rooms. Built purely with HTML, CSS, and Vanilla JavaScript. It works completely offline and is fully compatible with GitHub Pages.

## 📋 Features

- **Manage 10 Rooms:** Pre-configured for Rooms 101 to 110.
- **Fixed Appliances:** Tracks 10 standard electrical appliances.
- **Auto Save:** Data saves to your browser's Local Storage instantly as you type.
- **Room Dashboard:** Visual indicator of complete (✓) vs pending (○) rooms.
- **Progress Tracking:** Dynamic progress bar showing X/10 rooms completed.
- **Advanced PDF Generation:** Generates a professional, multi-page (10 pages) A4 PDF report using `jsPDF` and `html2canvas`.
- **Dark/Light Mode:** Seamlessly toggle between themes.
- **Data Backup:** Export to JSON and Import from JSON functions to transfer data across devices.
- **Responsive Design:** Beautiful, mobile, tablet, and desktop friendly UI with soft shadows and rounded cards.
- **Print Capability:** Clean print stylesheet to print individual room details without UI clutter.

## 📁 Project Structure

```text
/
├── index.html   # Main HTML structure and UI layout
├── style.css    # Responsive styling, CSS variables, Light/Dark themes
├── script.js    # Core logic, local storage state, dashboard updates
├── pdf.js       # PDF generation logic utilizing html2canvas and jsPDF
└── README.md    # Documentation and setup guide
