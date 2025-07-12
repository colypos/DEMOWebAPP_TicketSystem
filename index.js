var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let tickets = [];
let editingTicketId = null;
const API_URL = 'http://localhost:3000/tickets';
const ticketForm = document.getElementById('ticket-form');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const statusSelect = document.getElementById('status');
const urgencySelect = document.getElementById('urgency');
const cancelBtn = document.getElementById('cancel-edit-btn');
const ticketList = document.getElementById('ticket-list');
function renderMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}
function renderTickets() {
    ticketList.innerHTML = '';
    if (tickets.length === 0) {
        ticketList.innerHTML = '<p>Keine Tickets vorhanden.</p>';
        return;
    }
    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        if (ticket.id === editingTicketId) {
            card.classList.add('editing');
        }
        card.innerHTML = `
      <h3>${ticket.title}</h3>
      <div>${renderMarkdown(ticket.description)}</div>
      <div style="margin-top: 0.5rem;">
        <span class="badge ${ticket.status}">${ticket.status}</span>
        <span class="badge ${ticket.urgency}">${ticket.urgency}</span>
      </div>
      <button style="margin-top: 1rem;">Bearbeiten</button>
    `;
        const btn = card.querySelector('button');
        btn.addEventListener('click', () => startEditing(ticket.id));
        ticketList.appendChild(card);
    });
}
function loadTickets() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(API_URL);
        tickets = yield res.json();
        renderTickets();
    });
}
function createTicket(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const newTicket = yield res.json();
        tickets.unshift(newTicket);
        renderTickets();
    });
}
function updateTicket(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const updated = yield res.json();
        const index = tickets.findIndex(t => t.id === id);
        if (index !== -1) {
            tickets[index] = updated;
            renderTickets();
        }
    });
}
function handleFormSubmit(event) {
    event.preventDefault();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const status = statusSelect.value;
    const urgency = urgencySelect.value;
    if (!title || !description)
        return;
    if (editingTicketId === null) {
        createTicket({ title, description, status, urgency });
    }
    else {
        updateTicket(editingTicketId, { title, description, status, urgency });
    }
    cancelEditing();
}
function startEditing(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket)
        return;
    editingTicketId = id;
    titleInput.value = ticket.title;
    descInput.value = ticket.description;
    statusSelect.value = ticket.status;
    urgencySelect.value = ticket.urgency;
    ticketForm.querySelector('.submit-btn').textContent = 'Ticket aktualisieren';
    cancelBtn.hidden = false;
    renderTickets();
}
function cancelEditing() {
    editingTicketId = null;
    ticketForm.reset();
    ticketForm.querySelector('.submit-btn').textContent = 'Ticket erstellen';
    cancelBtn.hidden = true;
    renderTickets();
}
document.addEventListener('DOMContentLoaded', () => {
    ticketForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEditing);
    loadTickets();
});
