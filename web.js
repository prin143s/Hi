import './bot.js';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send('Telegram bot is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
