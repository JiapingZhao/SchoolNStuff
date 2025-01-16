// Time zones
const timeZones = {
    'new-york': 'America/New_York',
    'london': 'Europe/London',
    'beijing': 'Asia/Shanghai',
    'tokyo': 'Asia/Tokyo'
};

// Create clocks
Object.keys(timeZones).forEach(city => {
    const clock = document.getElementById(city);
    createClock(clock);
});

function createClock(clockElement) {
    const hourHand = document.createElement('div');
    hourHand.className = 'hand hour';
    const minuteHand = document.createElement('div');
    minuteHand.className = 'hand minute';
    const secondHand = document.createElement('div');
    secondHand.className = 'hand second';

    clockElement.appendChild(hourHand);
    clockElement.appendChild(minuteHand);
    clockElement.appendChild(secondHand);
}

function updateClocks() {
    Object.entries(timeZones).forEach(([city, timezone]) => {
        const options = {
            timeZone: timezone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const timeStr = formatter.format(new Date());
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);

        const clock = document.getElementById(city);
        const secondHand = clock.querySelector('.second');
        const minuteHand = clock.querySelector('.minute');
        const hourHand = clock.querySelector('.hour');

        // Updated hand rotation calculations - removed the +180 offset
        const secondDegrees = (seconds / 60) * 360;
        const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
        const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

        secondHand.style.transform = `rotate(${secondDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        hourHand.style.transform = `rotate(${hourDegrees}deg)`;

        // Update digital time
        const digitalTime = document.getElementById(`${city}-time`);
        digitalTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });
}

setInterval(updateClocks, 1000);
updateClocks();

// Deadlines Management
let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];

function addDeadline() {
    const title = document.getElementById('deadline-title').value;
    const date = document.getElementById('deadline-date').value;
    
    if (!title || !date) return;

    const deadline = {
        id: Date.now(),
        title,
        date
    };

    deadlines.push(deadline);
    saveDeadlines();
    renderDeadlines();
    
    // Clear inputs
    document.getElementById('deadline-title').value = '';
    document.getElementById('deadline-date').value = '';
}

function removeDeadline(id) {
    deadlines = deadlines.filter(d => d.id !== id);
    saveDeadlines();
    renderDeadlines();
}

function saveDeadlines() {
    localStorage.setItem('deadlines', JSON.stringify(deadlines));
}

function calculateDaysLeft(dateString) {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getDeadlineStatus(daysLeft) {
    if (daysLeft <= 3) return 'very-urgent';
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 15) return 'warning';
    return 'safe';
}

function makeDraggable(element) {
    element.draggable = true;
    
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        element.classList.add('dragging');
    });
    
    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
    });
}

function initializeDragAndDrop() {
    const container = document.getElementById('deadlines-list');
    
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(container, e.clientY);
        
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.deadline-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function renderDeadlines() {
    const container = document.getElementById('deadlines-list');
    container.innerHTML = '';

    deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

    deadlines.forEach(deadline => {
        const daysLeft = calculateDaysLeft(deadline.date);
        const status = getDeadlineStatus(daysLeft);
        const deadlineElement = document.createElement('div');
        deadlineElement.className = `deadline-item ${status}`;
        deadlineElement.dataset.id = deadline.id;
        deadlineElement.innerHTML = `
            <div>
                <h3>${deadline.title}</h3>
                <p>Date: ${new Date(deadline.date).toLocaleDateString('en-GB')}</p>
            </div>
            <p class="days-left">${daysLeft} <span>days left</span></p>
            <button onclick="removeDeadline(${deadline.id})">Remove</button>
        `;
        
        makeDraggable(deadlineElement);
        container.appendChild(deadlineElement);
    });
}

// Initial render
renderDeadlines();
initializeDragAndDrop(); 
renderDeadlines(); 

function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const icon = content.parentElement.querySelector('.toggle-icon');
    
    content.classList.toggle('expanded');
    icon.classList.toggle('expanded');
}

// Initialize sections as collapsed
document.addEventListener('DOMContentLoaded', () => {
    const sections = ['world-clocks', 'deadline-tracker'];
    sections.forEach(section => {
        const content = document.getElementById(`${section}-content`);
        content.classList.remove('expanded');
    });
}); 