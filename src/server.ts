import { createApp } from './app';
import { startScheduler } from './scheduler';

const PORT = Number(process.env.PORT) || 3000;

const app = createApp();
startScheduler();

app.listen(PORT, () => {
  console.log(`Comparator running at http://localhost:${PORT}`);
});
