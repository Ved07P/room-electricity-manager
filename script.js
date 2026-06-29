// --- Constants & Global State ---
const APPLIANCES = [
    "Bulb", "Tubelight", "Fan", "AC", "Cooler", 
    "TV", "Fridge", "Washing Machine", "Water Purifier / RO", "Geyser"
];

let rooms = [];
let currentRoomId = null;

// --- DOM Elements ---
const DOM = {
    roomList: document.getElementById('roomList'),
    addRoomBtn: document.getElementById('addRoomBtn'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    filterSelect: document.getElementById('filterSelect'),
    
    totalRooms: document.getElementById('totalRooms'),
    completedRooms: document.getElementById('completedRooms'),
    pendingRooms: document.getElementById('pendingRooms'),
    progressText: document.getElementById('progressText'),
    progressBar: document.getElementById('progressBar'),
    
    roomEditor: document.getElementById('roomEditor'),
    emptyState: document.getElementById('emptyState'),
    currentRoomTitle: document.getElementById('currentRoomTitle'),
    roomNameInput: document.getElementById('roomNameInput'),
    appliancesBody: document.getElementById('appliancesBody'),
    monthlyBill: document.getElementById('monthlyBill'),
    
    duplicateRoomBtn: document.getElementById('duplicateRoomBtn'),
    clearRoomBtn: document.getElementById('clearRoomBtn'),
    deleteRoomBtn: document.getElementById('deleteRoomBtn'),
    prevRoomBtn: document.getElementById('prevRoomBtn'),
    nextRoomBtn: document.getElementById('nextRoomBtn'),
    saveBtn: document.getElementById('saveBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    
    saveStatus: document.getElementById('saveStatus'),
    lastSavedTime: document.getElementById('lastSavedTime'),
    themeToggle: document.getElementById('themeToggle'),
    exportBtn: document.getElementById('exportBtn'),
    importInput: document.getElementById('importInput'),
    toastContainer: document.getElementById('toastContainer')
};

// --- Initialization ---
function init() {
    loadData();
    applyTheme();
    generateTableRows();
    setupEventListeners();
    
    if (rooms.length > 0) {
        selectRoom(rooms[0].id);
    } else {
        updateUI();
    }
}

// --- Data Management ---
function loadData() {
    const data = localStorage.getItem('roomManagerData');
    if (data) {
        rooms = JSON.parse(data);
    }
}

function saveData(showToast = true) {
    localStorage.setItem('roomManagerData', JSON.stringify(rooms));
    
    const now = new Date();
    DOM.lastSavedTime.textContent = `Last saved: ${now.toLocaleTimeString()}`;
    DOM.saveStatus.textContent = "✔️ Auto Saved";
    
    if (showToast) showNotification("Progress Saved!");
    updateDashboard();
    renderRoomList();
}

// --- Core Logic ---
function createRoom() {
    const newId = Date.now().toString();
    const newRoom = {
        id: newId,
        name: `Room ${rooms.length + 1}`,
        appliances: {},
        bill: "",
        completed: false
    };
    
    // Initialize appliance data
    APPLIANCES.forEach(app => {
        newRoom.appliances[app] = { quantity: "", star: "", hours: "" };
    });
    
    rooms.push(newRoom);
    saveData(false);
    selectRoom(newId);
    showNotification("New room created");
}

function duplicateRoom() {
    if (!currentRoomId) return;
    const currentRoom = rooms.find(r => r.id === currentRoomId);
    const newId = Date.now().toString();
    
    const duplicate = JSON.parse(JSON.stringify(currentRoom));
    duplicate.id = newId;
    duplicate.name = `${currentRoom.name} (Copy)`;
    
    rooms.push(duplicate);
    saveData(false);
    selectRoom(newId);
    showNotification("Room duplicated");
}

function deleteRoom() {
    if (!currentRoomId) return;
    if (!confirm("Are you sure you want to delete this room?")) return;
    
    rooms = rooms.filter(r => r.id !== currentRoomId);
    currentRoomId = null;
    
    saveData(false);
    if (rooms.length > 0) {
        selectRoom(rooms[0].id);
    } else {
        updateUI();
    }
    showNotification("Room deleted");
}

function clearCurrentRoom() {
    if (!currentRoomId) return;
    if (!confirm("Clear all data in this room?")) return;
    
    const room = rooms.find(r => r.id === currentRoomId);
    APPLIANCES.forEach(app => {
        room.appliances[app] = { quantity: "", star: "", hours: "" };
    });
    room.bill = "";
    checkCompletion(room);
    saveData(false);
    populateRoomEditor(room);
    showNotification("Room data cleared");
}

function clearAllData() {
    if (!confirm("WARNING: This will delete ALL rooms. Are you sure?")) return;
    rooms = [];
    currentRoomId = null;
    saveData(false);
    updateUI();
    showNotification("All data cleared");
}

// --- Validation & Completion ---
function validateNumeric(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
}

function checkCompletion(room) {
    let isComplete = true;
    
    // Check if every appliance field is filled (or at least defaults are set)
    // For this prompt: "A room is Completed only if every required field has been filled."
    for (let app of APPLIANCES) {
        const data = room.appliances[app];
        if (data.quantity === "" || data.star === "" || data.hours === "") {
            isComplete = false;
            break;
        }
    }
    if (room.bill === "") isComplete = false;
    
    room.completed = isComplete;
}

function handleInputUpdate() {
    if (!currentRoomId) return;
    const room = rooms.find(r => r.id === currentRoomId);
    
    room.name = DOM.roomNameInput.value || `Room ${room.id.slice(-4)}`;
    
    APPLIANCES.forEach((app, index) => {
        room.appliances[app].quantity = document.getElementById(`qty_${index}`).value;
        room.appliances[app].star = document.getElementById(`star_${index}`).value;
        room.appliances[app].hours = document.getElementById(`hrs_${index}`).value;
    });
    
    room.bill = DOM.monthlyBill.value;
    
    checkCompletion(room);
    
    // Auto-save debounce imitation (save immediately for simplicity and offline reliability)
    DOM.saveStatus.textContent = "⏳ Saving...";
    setTimeout(() => { saveData(false); }, 300);
}

// --- UI Rendering ---
function updateUI() {
    updateDashboard();
    renderRoomList();
    if (rooms.length === 0) {
        DOM.roomEditor.style.display = 'none';
        DOM.emptyState.style.display = 'flex';
    } else {
        DOM.roomEditor.style.display = 'block';
        DOM.emptyState.style.display = 'none';
    }
}

function updateDashboard() {
    const total = rooms.length;
    const completed = rooms.filter(r => r.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    DOM.totalRooms.textContent = total;
    DOM.completedRooms.textContent = completed;
    DOM.pendingRooms.textContent = pending;
    DOM.progressText.textContent = `${progress}%`;
    DOM.progressBar.style.width = `${progress}%`;
}

function renderRoomList() {
    const searchTerm = DOM.searchInput.value.toLowerCase();
    const sort = DOM.sortSelect.value;
    const filter = DOM.filterSelect.value;
    
    let filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm));
    
    if (filter === 'completed') filteredRooms = filteredRooms.filter(r => r.completed);
    if (filter === 'pending') filteredRooms = filteredRooms.filter(r => !r.completed);
    
    filteredRooms.sort((a, b) => {
        if (sort === 'asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
    });
    
    DOM.roomList.innerHTML = '';
    
    filteredRooms.forEach(room => {
        const li = document.createElement('li');
        li.className = `room-item ${room.id === currentRoomId ? 'active' : ''}`;
        
        const statusIcon = room.completed ? '✓' : '○';
        const statusClass = room.completed ? 'status-completed' : 'status-pending';
        
        li.innerHTML = `
            <span>${room.name}</span>
            <span class="status-icon ${statusClass}">${statusIcon}</span>
        `;
        li.onclick = () => selectRoom(room.id);
        DOM.roomList.appendChild(li);
    });
}

function generateTableRows() {
    DOM.appliancesBody.innerHTML = '';
    APPLIANCES.forEach((app, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app}</td>
            <td><input type="number" id="qty_${index}" min="0" placeholder="0"></td>
            <td><input type="number" id="star_${index}" min="0" placeholder="0"></td>
            <td><input type="number" id="hrs_${index}" min="0" placeholder="0"></td>
        `;
        DOM.appliancesBody.appendChild(tr);
    });
    
    // Attach event listeners to newly generated inputs
    const inputs = DOM.appliancesBody.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateNumeric(input);
            handleInputUpdate();
        });
    });
}

function selectRoom(id) {
    currentRoomId = id;
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    
    populateRoomEditor(room);
    updateUI();
}

function populateRoomEditor(room) {
    DOM.roomNameInput.value = room.name;
    DOM.currentRoomTitle.textContent = "Managing:";
    
    APPLIANCES.forEach((app, index) => {
        document.getElementById(`qty_${index}`).value = room.appliances[app].quantity || "";
        document.getElementById(`star_${index}`).value = room.appliances[app].star || "";
        document.getElementById(`hrs_${index}`).value = room.appliances[app].hours || "";
    });
    
    DOM.monthlyBill.value = room.bill || "";
}

function navigateRoom(direction) {
    if (rooms.length === 0) return;
    const currentIndex = rooms.findIndex(r => r.id === currentRoomId);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = rooms.length - 1;
    if (newIndex >= rooms.length) newIndex = 0;
    
    selectRoom(rooms[newIndex].id);
}

// --- Import / Export ---
function exportJSON() {
    if (rooms.length === 0) return showNotification("No data to export");
    
    const dataStr = JSON.stringify(rooms, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `room_electricity_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("JSON Backup Downloaded");
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                rooms = importedData;
                saveData(false);
                if (rooms.length > 0) selectRoom(rooms[0].id);
                else updateUI();
                showNotification("Data Imported Successfully");
            } else {
                alert("Invalid JSON format");
            }
        } catch (error) {
            alert("Error parsing JSON file");
        }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
}

// --- Theme & Extras ---
function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    DOM.themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    DOM.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    DOM.addRoomBtn.addEventListener('click', createRoom);
    DOM.duplicateRoomBtn.addEventListener('click', duplicateRoom);
    DOM.deleteRoomBtn.addEventListener('click', deleteRoom);
    DOM.clearRoomBtn.addEventListener('click', clearCurrentRoom);
    DOM.clearAllBtn.addEventListener('click', clearAllData);
    
    DOM.prevRoomBtn.addEventListener('click', () => navigateRoom(-1));
    DOM.nextRoomBtn.addEventListener('click', () => navigateRoom(1));
    
    DOM.saveBtn.addEventListener('click', () => saveData(true));
    DOM.exportBtn.addEventListener('click', exportJSON);
    DOM.importInput.addEventListener('change', importJSON);
    
    DOM.themeToggle.addEventListener('click', toggleTheme);
    
    DOM.searchInput.addEventListener('input', renderRoomList);
    DOM.sortSelect.addEventListener('change', renderRoomList);
    DOM.filterSelect.addEventListener('change', renderRoomList);
    
    DOM.roomNameInput.addEventListener('input', handleInputUpdate);
    DOM.monthlyBill.addEventListener('input', () => {
        validateNumeric(DOM.monthlyBill);
        handleInputUpdate();
    });
    
    document.getElementById('printBtn').addEventListener('click', () => {
        window.print();
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveData(true);
        }
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            createRoom();
        }
    });
}

// Boot up
window.onload = init;
        
