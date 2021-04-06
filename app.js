const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fileUpload = require('express-fileupload')

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
app.use(fileUpload())
// CORS Middleware
// app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());


// Passport Middleware

//My Auth
current_user_usn = '';
current_user = {};
// Index Route
app.get('/', (req, res) => {
  res.render('login')
});


app.get('/login', (req, res) => {
  res.render('login')
});

app.post('/login', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Student where rvce_email='" + req.body.username + "' and password='" + req.body.password + "';";
  console.log(sql);

  let query = db.query(sql, (err, user) => {
    if (err) throw err;
    console.log(user);
    if (user.length == 1) {
      current_user_usn = user[0].usn;
      current_user = user;
      res.render('student_dashboard', { user });
    }
    else
      res.send("User not found")
  });

});


app.get('/signup', (req, res) => {
  res.render('signup')
});

app.post('/signup', urlencodedParser, (req, res) => {

  var sql = "INSERT INTO Student(usn,fname,rvce_email,password) values('" + req.body.usn + "','" + req.body.fname + "','" + req.body.rvce_email + "','" + req.body.password + "');";
  console.log(sql);

  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
    res.send('Registered!');
  });

});

app.get('/upload_details', (req, res) => {
  console.log("CURRENT USER:\n"+ current_user[0].fname)
  res.render('upload_details', {current_user})
})


app.post('/save_student_details', urlencodedParser, (req, res) => {


  console.log(req.body)
  var sql = "UPDATE Student SET full_name = '" + req.body.full_name + "' , personal_email = '" + req.body.personal_email + "' , mobile = '" + req.body.mobile + "' ,dob = '" + req.body.dob + "' ,gender = '" + req.body.gender + "' ,tenth_perc =  " + req.body.tenth_perc + ",tenth_yop = " + req.body.tenth_yop + " ,twelfth_perc = " + req.body.twelfth_perc + " ,twelfth_yop = " + req.body.twelfth_yop + " ,graduation_perc = " + req.body.graduation_perc + " ,graduation_year = " + req.body.graduation_year + " ,graduation_degree = '" + req.body.graduation_degree + "' ,pg_cgpa = " + req.body.pg_cgpa + " ,year_gap = '" + req.body.year_gap + "' ,address = '" + req.body.address + "' where usn='" + current_user_usn + "';"
  console.log(sql)
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Details saved.');
  });


});


app.get('/resume', (req,res) => {
  res.render('resume', {current_user})
})

// View single resume
app.get('/resume/:id', (req, res) => {
  res.sendFile(__dirname + '/public/resume/' + req.params.id+'.pdf' );
});

app.post('/resume', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
      console.log(req.files)
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.resume;
  // uploadPath = __dirname + '/public/resume/' + current_user_usn + '-' + sampleFile.name;
  uploadPath = __dirname + '/public/resume/' + current_user_usn + '.pdf';

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

app.get('/pclogin', (req, res) => {
  res.render('pc_login')
});

app.post('/pclogin', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM PlacementCell where rvce_email='" + req.body.username + "' and password='" + req.body.password + "';";
  console.log(sql);

  let query = db.query(sql, (err, user) => {
    if (err) throw err;
    console.log(user);
    if (user.length == 1) {
      current_user_usn = user[0].usn;
      current_user = user;
      res.render('pc_dashboard', { user });
    }
    else
      res.send("User not found")
  });

});


app.get('/drive', (req, res) => {
  res.render('add_placement_drive')
});


// Start Server
app.listen(port, () => {
  console.log('Server started on port ' + port);
});
