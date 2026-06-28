// --- Constants & Global Variables ---
const ROOMS = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110'];
const APPLIANCES = [
    'Bulb', 'Tubelight', 'Fan', 'AC', 'Cooler', 'TV', 
    'Fridge', 'Washing Machine', 'Water Purifier / RO', 'Geyser'
];
const STORAGE_KEY = 'roomElectricityData';
let appData = {};
let currentRoom = '101';
let autoSaveTimeout;

// --- DOM Elements ---
const roomSelect = document.getElementById('room-select');
const searchRoomInput = document.getElementById('search-room');
const searchBtn = document.getElementById('search-btn');
const tableBody = document.getElementById('table-body');
const monthlyBillInput = document.getElementById('monthly-bill');
const statusChipsContainer = document.getElementById('status-chips');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const autoSaveIndicator = document.getElementById('auto-save-indicator');
const lastSavedTime = document.getElementById('last-saved-time');
const themeToggleBtn = document.getElementById('theme-toggle');

// Buttons
const saveBtn = document.getElementById('save-btn');
const saveNextBtn = document.getElementById('save-next-btn');
const prevBtn = document.getElementById('prev-btn');
const clearRoomBtn = document.getElementById('clear-room-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const printRoomBtn = document.getElementById('print-room-btn');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');

// --- Initialization ---
function init() {
    loadData();
    buildTable();
    buildDashboard();
    updateUI();
    setupEventListeners();
    applyTheme(localStorage.getItem('theme') || 'light');
}

function createEmptyRoomData() {
    const data = { bill: '' };
    APPLIANCES.forEach(app => {
        data[app] = { quantity: '', star: '', hours: '' };
    });
    return data;
}

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        appData = JSON.parse(stored);
    } else {
        ROOMS.forEach(room => appData[room] = createEmptyRoomData());
    }
    // Ensure all rooms exist in case of corrupted data
    ROOMS.forEach(room => {
        if (!appData[room]) appData[room] = createEmptyRoomData();
    });
}

function buildTable() {
    tableBody.innerHTML = '';
    APPLIANCES.forEach(appliance => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${appliance}</td>
            <td><input type="number" min="0" data-appliance="${appliance}" data-field="quantity" class="data-input"></td>
            <td><input type="number" min="0" max="5" data-appliance="${appliance}" data-field="star" class="data-input"></td>
            <td><input type="number" min="0" max="24" data-appliance="${appliance}" data-field="hours" class="data-input"></td>
        `;
        tableBody.appendChild(tr);
    });
}

function buildDashboard() {
    statusChipsContainer.innerHTML = '';
    ROOMS.forEach(room => {
        const chip = document.createElement('div');
        chip.id = `chip-${room}`;
        chip.className = 'status-chip';
        statusChipsContainer.appendChild(chip);
    });
    updateDashboard();
}

// --- Core Logic ---
function updateUI() {
    roomSelect.value = currentRoom;
    const roomData = appData[currentRoom];
    
    // Populate Table
    const inputs = document.querySelectorAll('.data-input');
    inputs.forEach(input => {
        const app = input.getAttribute('data-appliance');
        const field = input.getAttribute('data-field');
        input.value = roomData[app][field];
    });

    // Populate Bill
    monthlyBillInput.value = roomData.bill;
    
    updateDashboard();
}

function captureCurrentRoomData() {
    const inputs = document.querySelectorAll('.data-input');
    inputs.forEach(input => {
        const app = input.getAttribute('data-appliance');
        const field = input.getAttribute('data-field');
        appData[currentRoom][app][field] = input.value;
    });
    appData[currentRoom].bill = monthlyBillInput.value;
}

function isRoomCompleted(room) {
    const data = appData[room];
    if (data.bill === '') return false;
    
    for (let app of APPLIANCES) {
        if (data[app].quantity === '' || data[app].star === '' || data[app].hours === '') {
            return false;
        }
    }
    return true;
}

function updateDashboard() {
    let completedCount = 0;
    
    ROOMS.forEach(room => {
        const chip = document.getElementById(`chip-${room}`);
        if (isRoomCompleted(room)) {
            chip.className = 'status-chip completed';
            chip.innerHTML = `✓ Room ${room}`;
            completedCount++;
        } else {
            chip.className = 'status-chip pending';
            chip.innerHTML = `○ Room ${room}`;
        }
    });

    // Update Progress Bar
    const percent = (completedCount / ROOMS.length) * 100;
    progressBar.style.width = `${percent}%`;
    progressText.innerText = `${completedCount}/10 Rooms Completed`;
}

function saveData(showIndicator = true) {
    captureCurrentRoomData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateDashboard();
    
    if (showIndicator) {
        const now = new Date();
        lastSavedTime.innerText = `Last saved: ${now.toLocaleTimeString()}`;
        
        autoSaveIndicator.classList.remove('hidden');
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            autoSaveIndicator.classList.add('hidden');
        }, 1500);
    }
}

function clearCurrentRoom() {
    if(confirm(`Are you sure you want to clear data for Room ${currentRoom}?`)) {
        appData[currentRoom] = createEmptyRoomData();
        saveData(false);
        updateUI();
    }
}

function clearAllData() {
    if(confirm('⚠️ WARNING: This will delete ALL data for all 10 rooms. Proceed?')) {
        ROOMS.forEach(room => appData[room] = createEmptyRoomData());
        saveData(false);
        updateUI();
    }
}

function navigateRoom(direction) {
    saveData(false);
    const currentIndex = ROOMS.indexOf(currentRoom);
    if (direction === 'next' && currentIndex < ROOMS.length - 1) {
        currentRoom = ROOMS[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
        currentRoom = ROOMS[currentIndex - 1];
    }
    updateUI();
}

function searchRoom() {
    const val = searchRoomInput.value.trim();
    if (ROOMS.includes(val)) {
        saveData(false);
        currentRoom = val;
        updateUI();
        searchRoomInput.value = '';
    } else {
        alert('Room not found. Please enter a valid room number (101-110).');
    }
}

// --- Themes & Backups ---
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtn.innerHTML = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('theme', theme);
}

function exportJSON() {
    saveData(false);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "electricity_data_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importJSON(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                // Basic validation
                if (importedData['101'] && importedData['110']) {
                    appData = importedData;
                    saveData(false);
                    updateUI();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid file format.');
                }
            } catch (err) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
    }
    event.target.value = ''; // Reset input
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    roomSelect.addEventListener('change', (e) => {
        saveData(false);
        currentRoom = e.target.value;
        updateUI();
    });

    searchBtn.addEventListener('click', searchRoom);
    searchRoomInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') searchRoom();
    });

    // Auto-save on input change
    tableBody.addEventListener('input', () => saveData(true));
    monthlyBillInput.addEventListener('input', () => saveData(true));

    // Validation to prevent e, +, - in number fields
    document.addEventListener('keydown', (e) => {
        if(e.target.type === 'number' && ['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    });

    saveBtn.addEventListener('click', () => {
        saveData(true);
        alert('Data saved successfully!');
    });
    
    saveNextBtn.addEventListener('click', () => navigateRoom('next'));
    prevBtn.addEventListener('click', () => navigateRoom('prev'));
    clearRoomBtn.addEventListener('click', clearCurrentRoom);
    clearAllBtn.addEventListener('click', clearAllData);
    printRoomBtn.addEventListener('click', () => window.print());
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    exportBtn.addEventListener('click', exportJSON);
    importFile.addEventListener('change', importJSON);
}

// Start App
init();
