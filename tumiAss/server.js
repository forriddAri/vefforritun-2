const express = require('express');
const bodyParser = require('bodyParser');
const cors = require('cors');
const {pool} = require('pg');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
    }
};

export default reportWebVitals;

// PostgreSQL tenging
const pool = new Pool({
    user: 'postgres',        // Settu PostgreSQL notandanafn
    host: 'localhost',
    database: 'isskapur_db', // Settu gagnagrunnsnafn
    password: 'dimma2007',      // Settu lykilorð
    port: 5432,
});

// Endpoint til að skrifa í gagnagrunn
app.post('/add-item', async (req, res) => {
    const { name, quantity } = req.body;
    try {
        await pool.query(
            'INSERT INTO isskapur_items (name, quantity) VALUES ($1, $2)',
            [name, quantity]
        );
        res.status(200).send('Item added successfully.');
    } catch (error) {
        res.status(500).send('Error adding item: ' + error.message);
    }
});

// Keyra serverinn
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});