import express from 'express';
import {shortnerRoutes} from './routes/shortner.routes.js';
import { authroute } from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import { verifyAuthentication } from './middlewares/verify-auth.middleware.js';
import session from 'express-session';
import flash from 'connect-flash';
import reqip from 'request-ip'


const app = express();

const PORT = process.env.PORT||3004
app.use(cookieParser())

app.use(express.static('public'));
// Add middleware to parse form data
app.use(express.urlencoded({extended:true}))
//template engine
app.set('view engine','ejs');
app.use(session({
    secret:"my-secret",resave:true,saveUninitialized:false
}))
app.use(flash())
app.use(reqip.mw())

app.use(verifyAuthentication)
app.use((req,res,next)=>{
res.locals.user = req.user;
 console.log(`${req.method} ${req.path}`); 
return next();
})


app.use(authroute)
app.use(shortnerRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT} 🔥`);
})