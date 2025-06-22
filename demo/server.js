const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;
const WIDGET_PORT = 8081;

app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const widgetApp = express();
const widgetDistPath = path.join(__dirname, '../apps/widget/dist');

if (!fs.existsSync(widgetDistPath)) {
  console.error(`❌ Widget build not found at ${widgetDistPath}`);
  console.error('   Please ensure the widget is built before running the demo');
  process.exit(1);
}

widgetApp.use(express.static(widgetDistPath));
widgetApp.get('*', (req, res) => {
  res.sendFile(path.join(widgetDistPath, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    demo: 'ok',
    widgetPath: widgetDistPath,
    widgetExists: fs.existsSync(widgetDistPath)
  });
});

app.listen(PORT, () => {
  console.log(`
🚗 ACME Car Rentals Demo
🔗 http://localhost:${PORT}
📁 Demo files: ${__dirname}
  `);
});

widgetApp.listen(WIDGET_PORT, () => {
  console.log(`🔧 Widget Server: http://localhost:${WIDGET_PORT}`);
  console.log(`📁 Widget files: ${widgetDistPath}`);
});