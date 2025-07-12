interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'offen' | 'pausiert' | 'abgeschlossen';
  urgency: 'nicht-dringend' | 'dringend' | 'sehr-dringend';
  created_at?: string;
}

let tickets: Ticket[] = [];
let editingTicketId: number | null = null;

const API_URL = 'http://localhost:3000/tickets';

const ticketForm = document.getElementById('ticket-form') as HTMLFormElement;
const titleInput = document.getElementById('title') as HTMLInputElement;
const descInput = document.getElementById('description') as HTMLTextAreaElement;
const statusSelect = document.getElementById('status') as HTMLSelectElement;
const urgencySelect = document.getElementById('urgency') as HTMLSelectElement;
const cancelBtn = document.getElementById('cancel-edit-btn') as HTMLButtonElement;
const ticketList = document.getElementById('ticket-list') as HTMLDivElement;

function renderMarkdown(text: string): string {
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

    const btn = card.querySelector('button')!;
    btn.addEventListener('click', () => startEditing(ticket.id));

    ticketList.appendChild(card);
  });
}

async function loadTickets() {
  const res = await fetch(API_URL);
  tickets = await res.json();
  renderTickets();
}

async function createTicket(data: Omit<Ticket, 'id'>) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const newTicket = await res.json();
  tickets.unshift(newTicket);
  renderTickets();
}

async function updateTicket(id: number, data: Omit<Ticket, 'id'>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const updated = await res.json();
  const index = tickets.findIndex(t => t.id === id);
  if (index !== -1) {
    tickets[index] = updated;
    renderTickets();
  }
}

function handleFormSubmit(event: Event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const status = statusSelect.value as Ticket['status'];
  const urgency = urgencySelect.value as Ticket['urgency'];

  if (!title || !description) return;

  if (editingTicketId === null) {
    createTicket({ title, description, status, urgency });
  } else {
    updateTicket(editingTicketId, { title, description, status, urgency });
  }

  cancelEditing();
}

function startEditing(id: number) {
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return;

  editingTicketId = id;
  titleInput.value = ticket.title;
  descInput.value = ticket.description;
  statusSelect.value = ticket.status;
  urgencySelect.value = ticket.urgency;

  (ticketForm.querySelector('.submit-btn') as HTMLButtonElement).textContent = 'Ticket aktualisieren';
  cancelBtn.hidden = false;

  renderTickets();
}

function cancelEditing() {
  editingTicketId = null;
  ticketForm.reset();
  (ticketForm.querySelector('.submit-btn') as HTMLButtonElement).textContent = 'Ticket erstellen';
  cancelBtn.hidden = true;
  renderTickets();
}

document.addEventListener('DOMContentLoaded', () => {
  ticketForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', cancelEditing);
  loadTickets();
});
