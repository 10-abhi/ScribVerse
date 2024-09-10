import { Hono } from 'hono'
import blogRoute from './routes/blog';
import userRoute from './routes/user';

const app = new Hono<{}>();

app.route('api/v1/user' , userRoute);
app.route('api/v1/blog' , blogRoute);

export default app;
