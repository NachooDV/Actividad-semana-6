const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const app = express();

// servir archivos
app.use(express.static(path.join(__dirname)));

// ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// certificados
const options = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt')
};

// servidor HTTPS
https.createServer(options, app).listen(3000, () => {
  console.log('Servidor corriendo en https://localhost:3000');
});