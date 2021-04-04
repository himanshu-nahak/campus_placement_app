const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');


// Connect To Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'CPSA'
});

// Connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySql Connected...');
});

const app = express();

// Port Number
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');

// CORS Middleware
// app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());


// Passport Middleware

// Index Route
app.get('/', (req, res) => {
  res.render('login')
});

app.post('/login', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Student where rvce_email='" + req.body.username + "' and password='" + req.body.password + "';";
  console.log(sql);

  let query = db.query(sql, (err, results) => {
    if (err) throw err;
   console.log(results);
    if (results.length == 1)
      res.render('student_dashboard', {results});
    else
      res.send("User not found")
  });

});


// Start Server
app.listen(port, () => {
  console.log('Server started on port ' + port);
});
