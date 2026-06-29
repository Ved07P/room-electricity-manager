# ⚡ Room Electricity Manager

A complete, professional, and mobile-friendly web application designed to manage, calculate, and report electricity usage across an unlimited number of rooms. 

Built strictly with vanilla web technologies, this app runs entirely offline, persists data safely, and features highly optimized PDF generation handling hundreds of rooms smoothly.

## 🚀 Features

- **Unlimited Room Management:** Add, duplicate, delete, and manage custom-named rooms without limits.
- **Auto Save:** Never lose data. Real-time auto-saving to Local Storage on every input stroke.
- **Smart Dashboard:** Live tracking of Total, Completed, and Pending rooms with a visual progress bar.
- **Optimized PDF Generation:** Uses `jsPDF` vector rendering (no bloated full-page images) targeting ultra-low file sizes (< 5MB for 100+ rooms). Generates standardized A4 reports automatically paginated.
- **Import / Export JSON:** Easily backup your entire database to a `.json` file and restore it instantly.
- **Advanced UI:** Fully responsive design (Desktop, Tablet, Mobile) with Light & Dark modes.
- **Shortcuts & Utilities:** Sorting, searching, filtering, toast notifications, and keyboard shortcuts (`Ctrl+S` to save, `Alt+N` for new room).

## 📁 Folder Structure

```text
room-electricity-manager/
├── index.html     # Main HTML structure and UI layout
├── style.css      # CSS styles, variables, themes, and responsiveness
├── script.js      # Core logic, DOM manipulation, state management
├── pdf.js         # Dedicated optimized PDF generation logic
└── README.md      # Project documentation
