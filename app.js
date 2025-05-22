const express = require('express');
const morgan = require('morgan');
const mangoose = require('mongoose');
const AuthRoutes = require('./routes/AuthRoutes');
const cookieParser = require('cookie-parser');
const BlogRoutes = require('./routes/BlogRoutes')
const WebRoutes = require('./routes/web')
const methodOverride = require('method-override');
const {requireAuth, checkUser} = require('./middleware/authMiddleware');
const app = express();

//passes request body into json
app.use(express.json());

//cookie parser
app.use(cookieParser());

//connect to mangoDB
const dbURI = 'mongodb://admin:bbaef5af5242f5a3206bc93bf83a69a480637b4e7fdc090d@46.101.22.107:27017/imo?authSource=admin';
mangoose.connect(dbURI,{useNewUrlParser:true, useUnifiedTopology:true })
.then((result)=>console.log('Connected to the System -> http://localhost:3000/'))
.catch((err)=>console.log(err));


app.set('view engine','ejs');
app.listen(3000);
        
//middleware with static files
app.use(express.static('public'));
app.use((express.urlencoded({extended : true})));
app.use(methodOverride('_method'))

//3rd Party Middleware
app.use(morgan('dev'));

//user data to the pages
app.get("*",checkUser);

//Auth Routes
app.use(AuthRoutes);

//Blog Routes
app.use(BlogRoutes);

//Web Routes
app.use(WebRoutes);



