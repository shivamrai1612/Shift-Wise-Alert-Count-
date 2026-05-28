import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 4000;

createApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
