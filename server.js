const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect(path.join(__dirname, 'public', 'index.html'));
});

app.get('/github', (req, res) => {
    res.redirect("https://github.com/cns-studios");
});

app.get('/docs', (req, res) => {
    res.redirect(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/login', (req, res) => {
    res.redirect(path.join(__dirname, 'public', 'login.html'));
});

app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
