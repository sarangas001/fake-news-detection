import 'dotenv/config';
import express, {Request, Response} from 'express';
import dontenv from 'dotenv';
import routes from './routes';

dontenv.config();

const app = express();
app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.use("/api/", routes);

export default app;