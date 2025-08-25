const express = require('express');
const app = express();



app.get('/ready', (req, res) => res.send('get your data'));

app.get('/health', (req, res) => res.send('Still working... on *my* machine 🧃'));

app.get('/', (req, res) => res.send('Welcome to it-works-on-my-machine'));


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

