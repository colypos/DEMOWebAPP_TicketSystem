import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: 'sql.isobel.ch',
  port: 5432,
  user: 'TrackerUser',
  password: 'ew3jPv3XSda&KuB&y1', // ACHTUNG: in der Realität mit .env arbeiten
  database: 'TrackerDB'
});

// Tickets abrufen
app.get('/tickets', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Tickets' });
  }
});

// Ticket erstellen
app.post('/tickets', async (req: Request, res: Response) => {
  const { title, description, status, urgency } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tickets (title, description, status, urgency)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, status, urgency]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Tickets' });
  }
});

// Ticket aktualisieren
app.put('/tickets/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { title, description, status, urgency } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tickets
       SET title = $1, description = $2, status = $3, urgency = $4
       WHERE id = $5
       RETURNING *`,
      [title, description, status, urgency, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket nicht gefunden.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren.' });
  }
});

app.listen(port, () => {
  console.log(`API läuft unter http://localhost:${port}`);
});