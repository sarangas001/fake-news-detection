import 'dotenv/config';
import express, {Request, Response} from 'express';
import dontenv from 'dotenv';

dontenv.config();

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

export default app;