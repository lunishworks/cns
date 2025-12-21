require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http'); // Using the native http module

const app = express();
const port = process.env.PORT || 3000;

// The URL for the central authentication service
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';


app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

app.get('/api/config', (req, res) => {
    res.json({ authServiceUrl: AUTH_SERVICE_URL });
});

app.get('/api/auth/status', (req, res) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.json({ authenticated: false });
    }

    const options = {
        hostname: new URL(AUTH_SERVICE_URL).hostname,
        port: new URL(AUTH_SERVICE_URL).port,
        path: '/api/me',
        method: 'GET',
        headers: {
            'Cookie': `auth_token=${token}`
        }
    };

    const authReq = http.request(options, (authRes) => {
        let data = '';
        authRes.on('data', (chunk) => {
            data += chunk;
        });
        authRes.on('end', () => {
            if (authRes.statusCode === 200) {
                const userData = JSON.parse(data);
                res.json({ authenticated: true, username: userData.username });
            } else {
                res.json({ authenticated: false });
            }
        });
    });

    authReq.on('error', (error) => {
        console.error('Error calling auth service:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });

    authReq.end();
});

// --- Static Page Routes ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'policy.html'));
});

app.get('/tos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tos.html'));
});

app.get('/support', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'support.html'));
});

app.get('/github', (req, res) => {
    res.redirect('https://github.com/cns-studios');
});


// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).send('Address not found');
});

// --- Server Initialization ---
app.listen(port, () => {
    console.log(`✓ CNS Main App running on http://localhost:${port}`);
});
