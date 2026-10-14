import * as express from 'express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express.default();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
