var express = require('express');
var ejs = require('ejs');
var mysql = require('mysql2');
var session = require('express-session');
const expressSanitizer = require('express-sanitizer');

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 600000 }
}));

app.use(express.static(__dirname + '/public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'appuser',
    password: 'AppUser#2024',
    database: 'bettys_books'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

app.locals.shopData = { shopName: "Recipe Finder" };

// const mealHelper = require("./helper/meals");
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

const recipesRouter = require("./routes/recipes");
app.use("/recipes", recipesRouter);


app.listen(port, () => console.log(`Node app listening on port ${port}!`));
