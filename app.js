const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fileUpload = require('express-fileupload')
var moment = require('moment'); // require


//adding this to read the excel file
var excelr = require('read-excel-file/node');
const { response } = require('express');
const { start } = require('repl');

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
  res.render('home', { title: 'Campus Placements' })
});



app.get('/companyresources', (req, res) => {
  res.render('companyresources');
});

app.get('/student_profile', (req, res) => {
  res.render('student_profile')
});


app.get('/login', (req, res) => {
  res.render('login')
});



app.post('/dashboard', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Student where rvce_email='" + req.body.username + "' and password='" + req.body.password + "';";
  console.log(sql);

  let query = db.query(sql, (err, user) => {
    if (err) throw err;
    console.log(user);
    if (user.length == 1) {
      current_user_usn = user[0].usn;
      current_user = user;
      res.render('dashboard', { user });
    }
    else
      res.send("User not found")
  });

});

app.get('/myprofile', (req, res) => {
  user = {};
  user = current_user[0];
  res.render('student_profile', { user })

  // var msg = JSON.stringify(current_user)
  // console.log(">>"+msg)

  // var msg = JSON.stringify(user)
  // console.log(">>"+msg)
  // res.send(user.usn);
});

app.get('/dashboard', (req, res) => {
  user = {};
  user = current_user[0];
  res.render('dashboard', { user })
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
  console.log("CURRENT USER:\n" + current_user[0].fname)
  res.render('upload_details', { current_user })
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


app.get('/resume', (req, res) => {
  // console.log("RESUME>>"+current_user[0].resume)
  res.render('resume', { current_user })
})

// View single resume
app.get('/resume/:id', (req, res) => {
  res.sendFile(__dirname + '/public/resume/' + req.params.id + '.pdf');
});

app.post('/resume', function (req, res) {
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
  sampleFile.mv(uploadPath, function (err) {
    if (err)
      return res.status(500).send(err);

    var sql = "UPDATE Student SET resume = '1';"
    console.log(sql)
    let query = db.query(sql, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send('Resume uploaded!');

    });


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

      var sql2 = "SELECT * FROM PlacementDrive ; ";
      console.log("SQL QUERY TO BE FIRED: " + sql);
      let query2 = db.query(sql2, (err, placement_drives) => {
        if (err) throw err;
        console.log(placement_drives);
        res.render('pc_dashboard', { user, placement_drives });
      });

    }
    else
      res.send("User not found")
  });

});


app.get('/drive', (req, res) => {
  res.render('add_placement_drive')
});

app.post('/drive', urlencodedParser, (req, res) => {

  var company_name = "'" + req.body.company_name + "'";
  var role_name = "'" + req.body.role_name + "'";
  var offer = "'" + req.body.offer + "'";
  var package = req.body.package;
  var drive_date = "'" + req.body.round1date + "'";
  var gender = "'" + req.body.cgender + "'";
  if (gender == "'M,F'") gender = "'A'";
  var mcacgpa = req.body.mcacgpa;
  var graduationcgpa = req.body.gradcpga;
  var activebacklogs = req.body.activebacklog;
  var educationgap = req.body.edugap;


  var sql = "INSERT INTO PlacementDrive(company_name, role_name, offer, package, drive_date, gender, mcacgpa, graduationcgpa, activebacklogs, educationgap) VALUES (" + company_name + "," + role_name + "," + offer + "," + package + "," + drive_date + "," + gender + "," + mcacgpa + "," + graduationcgpa + "," + activebacklogs + "," + educationgap + ");";
  console.log(sql);

  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    var sql = "SELECT * FROM PlacementDrive ; ";
    console.log("SQL QUERY FIRED: " + sql);

    let query = db.query(sql, (err, placement_drives) => {
      if (err) throw err;
      console.log(placement_drives);
      if (placement_drives.length > 0) {
        res.render('pc_dashboard', { current_user, placement_drives });
      }
      else
        res.send("User not found")
    });

    // res.render('pc_dashboard')
  });

});

//shreya
app.get('/drive_create', (req, res) => {
  res.render('drive_create.ejs')  //change
});

app.post('/drive_create', urlencodedParser, (req, res) => {


  console.log(req.body)
  var sql = "INSERT INTO Drive(drive_id,drive_name,com_email,com_name,com_id,offer_type,drive_create_date) values('" + req.body.d_id + "','" + req.body.dname + "','" + req.body.company_email + "','" + req.body.company_name + "','" + req.body.company_id + "','" + req.body.offer1 + "','" + req.body.drive_date + "');";
  console.log(sql)
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.redirect('/view_drives_spc')
    // res.send('Drive Created Successfully');
  });


});

//app.get('/drive_list', (req, res) => {
//res.render(__dirname+'/drive_list.ejs')
//});

app.get('/drive_list', urlencodedParser, (req, res) => {

  var sql = "SELECT drive_create_date,drive_id,drive_name,com_id,com_name,com_email,offer_type FROM Drive;";
  console.log(sql);

  let query = db.query(sql, (err, data, fields) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      res.render('drive_list.ejs', { title: 'Drive', userData: data });
    }
    else
      res.send("User not found");
  });

});

app.get('/drive_entry/:id', urlencodedParser, (req, res) => {
  var d_id = req.params.id;
  var sql = "SELECT drive_create_date,drive_id,drive_name,com_id,com_name,com_email,offer_type FROM Drive where drive_id='" + d_id + "';";
  console.log(sql);
  let query = db.query(sql, (err, data, fields) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      res.render('drive_entry.ejs', { title: 'Drive', userData: data });
    }
    else
      res.send("Drive doesnot exists");
  });

});














app.get('/round_list', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Round_detail;";
  console.log(sql);

  let query = db.query(sql, (err, data, fields) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      res.render('round_list.ejs', { title: 'Round_detail', userData: data });
    }
    else
      res.send("User not found");
  });

});

app.get('/rounds/:id/:R_no/', urlencodedParser, (req, res) => {
  var d_id = req.params.id;
  var r_no = req.params.R_no;



  res.sendFile(__dirname + '/public/rounds/' + d_id + "-" + r_no + '.xlsx');




  /*var sql = "SELECT * FROM Round_detail where drive_id='"+d_id+"'AND Round_no='"+d_no+"';";
  console.log(sql);
  let query = db.query(sql, (err, data,fields) => {
      if (err) throw err;
      console.log(data);
      if (data.length != 0) {
        res.render('round_detail.ejs', {title: 'Drive' , userData : data});
      }
      else
        res.send("Round doesnot exists");
    });
    */
  //  res.render('round_detail.ejs',{title: 'Round detail', userData : })
});

app.get('/Round_detail/:drive_id', (req, res) => {
  let drive_id = req.params.drive_id;
  res.render('create_round.ejs', { drive_id });
});

app.post('/Round_detail/:drive_id', urlencodedParser, (req, res) => {
  // res.send(req.body)
  let drive_id = req.params.drive_id;
  // var sql = "INSERT into Round_detail(drive_id,Round_no,Round_name,selected_stud_list,Reg_start_date,Reg_end_date) values('" + drive_id + "','" + req.body.r_no + "','" + req.body.r_name + "','" + req.files.selected_student_file.name + "','" + req.body.r_start + "','" + req.body.r_end + "');";
  // console.log(sql);
  // // console.log("HHHH=>" + req.files.round_selected_list.name);

  let round_select_list_file;
  let uploadPath_round_select_list;

  if (!req.files || Object.keys(req.files).length === 0) {
    console.log(req.files)
    console.log(req.body.selected_student_file)

    return res.status(400).send('No files were uploaded.');
  }
  var d = new Date().getTime();;
  round_select_list_file = req.files.selected_student_file;
  // uploadPath = __dirname + '/public/resume/' + current_user_usn + '-' + sampleFile.name;
  uploadPath_round_select_list = __dirname + '/public/rounds/' + d + req.files.selected_student_file.name;

  // Use the mv() method to place the file somewhere on your server
  round_select_list_file.mv(uploadPath_round_select_list, function (err) {
    if (err)
      return res.status(500).send(err);


    let dbpath = '/rounds/' + d + req.files.selected_student_file.name;

    var sql = "INSERT into Round_detail(drive_id,Round_no,Round_name,selected_stud_list,Reg_start_date,Reg_end_date) values('" + drive_id + "','" + req.body.r_no + "','" + req.body.r_name + "','" + dbpath + "','" + req.body.r_start + "','" + req.body.r_end + "');";

    var query = db.query(sql, (err, data) => {
      if (err) throw err;
      console.log(data);
      res.redirect("/view_drives_spc");
    });
  });

});




//till here

//student portal to view drives and rounds

app.get('/view_drives', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Drive;";
  console.log(sql);

  let query = db.query(sql, (err, data) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      res.render('drives.ejs', { title: 'Ongoing Placement Drives', drives: data });
    }
    else
      res.send("User not found");
  });

});

app.get('/view_drives_spc', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Drive;";
  console.log(sql);

  let query = db.query(sql, (err, data) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      res.render('drives_spc.ejs', { title: 'Ongoing Placement Drives', drives: data });
    }
    else
      res.send("User not found");
  });

});








app.get('/del_drive/:driveid', (req, res) => {

  var dsql = "DELETE  FROM Drive where drive_id='" + req.params.driveid + "';";
  console.log(dsql);

  let query = db.query(dsql, (err, data, fields) => {
    if (err) throw err;
    var ddsql = "DELETE  FROM Round_detail where drive_id='" + req.params.driveid + "';";
    console.log(ddsql);

    let query = db.query(ddsql, (err, data, fields) => {
      if (err) throw err;
      var sql = "SELECT * FROM Drive;";
      console.log(sql);

      let query = db.query(sql, (err, data) => {
        if (err) throw err;
        console.log(data);
        if (data.length != 0) {
          res.render('drives_spc.ejs', { title: 'Ongoing Placement Drives', drives: data });
        }
        else
          res.send("User not found");
      });
    });
  });
});





app.get('/view_rounds/:drive_id', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Round_detail where drive_id='" + req.params.drive_id + "' ;";
  console.log(sql);

  let query = db.query(sql, (err, data) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      // var startdate = moment(data.Reg_start_date).format('MM-DD-YYYY')
      // console.log(startdate)
      // data.Reg_start_date = startdate;
      res.render('rounds.ejs', { title: 'Drive Round List', rounds: data });
    }
    else
      res.render('rounds.ejs', { title: 'Drive Round List', rounds: data });
  });

});

app.get('/spcview_rounds/:drive_id', urlencodedParser, (req, res) => {

  var sql = "SELECT * FROM Round_detail where drive_id='" + req.params.drive_id + "' ;";
  console.log(sql);
  var drive_id = req.params.drive_id;
  let query = db.query(sql, (err, data) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      // var startdate = moment(data.Reg_start_date).format('MM-DD-YYYY')
      // console.log(startdate)
      // data.Reg_start_date = startdate;
      res.render('rounds_spc.ejs', { title: 'Drive Round List', rounds: data, drive_id });
    }
    else
      res.render('rounds_spc.ejs', { title: 'Drive Round List', rounds: data, drive_id });
  });

});

app.get('/delround/:d_id/:r_no', (req, res) => {

  var dsql = "DELETE  FROM Round_detail where drive_id='" + req.params.d_id + "' and Round_no=" + req.params.r_no + ";";
  console.log(dsql);

  let query = db.query(dsql, (err, data, fields) => {
    if (err) throw err;

    // var sql = "SELECT * FROM Round_detail where drive_id='" + req.params.drive_id + "' ;";
    // console.log(sql);
    // var drive_id = req.params.drive_id;
    // let query = db.query(sql, (err, data) => {
    //   if (err) throw err;
    //   console.log(data);
    //   if (data.length != 0) {
    // var startdate = moment(data.Reg_start_date).format('MM-DD-YYYY')
    // console.log(startdate)
    // data.Reg_start_date = startdate;
    // res.render('rounds_spc.ejs', { title: 'Drive Round List', rounds: data, drive_id });
    res.redirect('/view_drives_spc')
    // }
    //   else
    //     res.redirect('/view_drives_spc')
    // });
  });
});


app.get('/logout', (req, res) => {
  current_user = {}
  current_user_usn = "";
  res.render('home.ejs');
});

app.get('/test', (req, res) => {
  let path = '/resume/1RD19MCA05.pdf'
  res.render('test.ejs', { path });
});

app.get('/companyresourceadd', (req, res) => {
  res.render('company_resource_create.ejs');
});


app.get('/companyresourceview', (req, res) => {

  var sql = "SELECT * FROM CompanyResource ;";
  console.log(sql);
  let query = db.query(sql, (err, data, fields) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      res.render('company_resource_view.ejs', { title: 'Company Resources', cr: data });
    }
    else
      res.send("Company Records do not exist");
  });

});

app.get('/companyresourceviewspc', (req, res) => {

  var sql = "SELECT * FROM CompanyResource ;";
  console.log(sql);
  let query = db.query(sql, (err, data, fields) => {
    if (err) throw err;
    console.log(data);
    if (data.length != 0) {
      res.render('company_resource_spc.ejs', { title: 'Company Resources', cr: data });
    }
    else
      res.send("Company Records do not exist");
  });

});


app.post('/companyresource', (req, res) => {
  let crFile;
  let crUploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  console.log(req.files)
  console.log(req.body.company_name)



  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  crFile = req.files.companyresource;
  // res.send(crFile)

  // uploadPath = __dirname + '/public/resume/' + current_user_usn + '-' + sampleFile.name;
  crUploadPath = __dirname + '/public/cr/' + req.files.companyresource.name;
  // res.send(crUploadPath)
  let dbpath = '/cr/' + req.files.companyresource.name;
  //   // Use the mv() method to place the file somewhere on your server
  crFile.mv(crUploadPath, function (err) {
    if (err)
      return res.status(500).send(err);

    // ////////////

    var sql = "INSERT INTO CompanyResource( com_name, cr_name) VALUES ('" + req.body.company_name + "','" + dbpath + "');";
    console.log(sql);

    let query = db.query(sql, (err, result) => {
      if (err) throw err;
      console.log("INSERTED COMPANY RESOURCE" + result);

      res.redirect(302, '/companyresourceviewspc');

    });

    // res.render('pc_dashboard')

  });
});


app.get('/delcr/:crname', (req, res) => {

  var dsql = "DELETE  FROM CompanyResource where com_name='" + req.params.crname + "';";
  console.log(dsql);

  let query = db.query(dsql, (err, data, fields) => {
    if (err) throw err;

    var sql = "SELECT * FROM CompanyResource ;";
    console.log(sql);
    let query = db.query(sql, (err, data, fields) => {
      if (err) throw err;
      console.log(data);
      if (data.length != 0) {
        res.render('company_resource_spc.ejs', { title: 'Company Resources', cr: data });
      }
      else
        res.send("Company Records do not exist");
    });
  });
});




app.get('*', (req, res) => {
  res.status(404).render('404.ejs');
});

// Start Server
app.listen(port, () => {
  console.log('Server started on port ' + port);
});
