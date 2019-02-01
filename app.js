var express = require("express");
var app = express();
var mysql = require('mysql');
var bodyParser = require("body-parser");
var session = require('express-session');
var moment = require('moment');
moment().format();

app.use(express.static("public"))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
app.use(bodyParser.urlencoded({extended: true}));
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "toor",
    database : "project"
  });
con.connect(function(err){
    if(err)
        throw err;
    console.log("Connected to mysql!");
});


//functions
function isLoggedIn(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/login');
    }
  }

  function today(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
     if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
    
    today = yyyy+'-'+mm+'-'+dd;
    return today;
  }

                                    //GET requestss

app.get('/', function(req,res) {
    res.render('main.ejs');
});


app.get('/success', function(req,res) {
    res.render('success.ejs');
});

app.get('/rooms', function(req,res) {
    sql = "select * from roomtypedetails";
    con.query(sql, function (err, result, fields) {
        if (err) 
            throw err;
        res.render("room.ejs",{result : result});
      });
});

app.get('/book', function(req,res) {
    sql = "select * from roomtypedetails";
    con.query(sql, function (err, result, fields) {
        if (err) 
            throw err;
        res.render("book.ejs",{result : result});
      });
});

//employee pages
app.get('/login', function(req,res) {
    if(!req.session.user)
        res.render('login.ejs');
    else
        res.redirect('/employee');
});

app.get('/employee',isLoggedIn, function(req,res) {
    res.render('employee.ejs');
});

app.get('/checkin', isLoggedIn, function(req,res) {
        res.render('checkin.ejs');
});

app.get('/checkout', isLoggedIn, function(req,res) {
    res.render('checkout.ejs');
});

app.get('/addexpense', isLoggedIn, function(req,res) {
    res.render('addexpense.ejs');
});

//misc pages
app.get('/error/:errorcode', function(req,res) {
    var ecode = req.params.errorcode;
    var emessage = null;
    switch (ecode){
        
        case '101': emessage = "Invalid username or password";
                    break;
        case '201': emessage = "Sorry no rooms fullfilling all your criteria are available";
                    break;
        case '202': emessage = "A preexisting booking of that aadhar number already exists";
                    break;
        case '301': emessage = "Could not find a valid entry matching that aadhar number";
                    break;
        case '404': emessage = "Page not found";
                    break;

        default: emessage = "Invalid Error Code";
    }
    res.render('error.ejs',{emessage : emessage});
});

app.get('*', function(req,res) {
    res.redirect('/error/404');
});

                                    //POST requests

app.post('/reserve',function(req,res){
    req.session.rselect = req.body.rselect;
    req.session.checkin = req.body.checkin;
    req.session.checkout = req.body.checkout;
    sql = "select * from rooms where room_type = "+mysql.escape(req.session.rselect)+" and room_number not in (select room_number from reservations where "+mysql.escape(req.session.checkin)+"between TentativeCheckInDate and TentativeCheckOutDate or "+mysql.escape(req.session.checkout)+" between TentativeCheckInDate and TentativeCheckOutDate) ;";
    con.query(sql, function (err, result, fields) {
        if (err) 
            throw err;
        else if(result.length==0 || req.session.checkin < today() || req.session.checkout <= today() || req.session.checkin > req.session.checkout)
            res.redirect('/error/201')
        else{
            req.session.room_number = result[0].room_number;
            res.render('reserve.ejs');
        }
      });
});

app.post('/addreservation',function(req,res){
    var fname = req.body.fname;
    var lname = req.body.lname;
    var aadhar = req.body.aadhar;
    var address = req.body.address;
    var dob = req.body.dob;
    var phno = req.body.phone_number;
    sql = "select * from customer where aadhar ="+mysql.escape(aadhar)+';';
    con.query(sql, function (err, result, fields) {
        if (err) 
            throw err;
        else if(result.length!=0){
            sql = "select * from checksout where customer_aadhar ="+mysql.escape(aadhar)+';';
            con.query(sql, function (err, result, fields) {
            if (err) 
                throw err;
            else if(result.length!=0){
                    sql = "delete from customer where aadhar = "+mysql.escape(aadhar)+';';
                    con.query(sql, function (err, result, fields) {
                        if (err) 
                            throw err; 
                        else{
                            sql = "insert into Customer  values ("+mysql.escape(fname)+','+mysql.escape(lname)+','+mysql.escape(aadhar)+','+mysql.escape(address)+','+mysql.escape(dob)+');';
                            con.query(sql, function (err, result, fields) {
                                if (err) 
                                    throw err;  
                              });
                              sql = "insert into reservations values ("+mysql.escape(aadhar)+','+mysql.escape(req.session.checkin)+','+mysql.escape(req.session.checkout)+','+mysql.escape(req.session.room_number)+');';
                              con.query(sql, function (err, result, fields) {
                                  if (err) 
                                      throw err;  
                                }); 
                                sql = "insert into customercontactdetails values ("+mysql.escape(aadhar)+','+mysql.escape(phno)+');';
                              con.query(sql, function (err, result, fields) {
                                  if (err) 
                                      throw err;  
                                }); 
                                res.redirect('/success');
                        }
                        
                    });}  
                    else{
                        res.redirect('/error/202')
                    }    
        });} 
        else{
            sql = "insert into Customer  values ("+mysql.escape(fname)+','+mysql.escape(lname)+','+mysql.escape(aadhar)+','+mysql.escape(address)+','+mysql.escape(dob)+');';
        con.query(sql, function (err, result, fields) {
            if (err) 
                throw err;  
          });
          sql = "insert into reservations values ("+mysql.escape(aadhar)+','+mysql.escape(req.session.checkin)+','+mysql.escape(req.session.checkout)+','+mysql.escape(req.session.room_number)+');';
          con.query(sql, function (err, result, fields) {
              if (err) 
                  throw err;  
            }); 
            sql = "insert into customercontactdetails values ("+mysql.escape(aadhar)+','+mysql.escape(phno)+');';
          con.query(sql, function (err, result, fields) {
              if (err) 
                  throw err;  
            }); 
            res.redirect('/success');
        }
      });    
});

//employee post requests
app.post('/logincheck',function(req,res){
    var u = req.body.u;
    var p = req.body.p;
    sql = "select * from employee where id = "+mysql.escape(u)+";";
    con.query(sql, function (err, result, fields) {     
        if (err) 
            console.log(err.sqlMessage);
        else if (result.length == 0)
            res.redirect('/error/101');
        else if (result[0].Password != p)
            res.redirect('/error/101')
        else{
            if(req.session.admin)
                delete req.session.admin;//to make sure admin is not logged in as well
            req.session.user = u;
            res.redirect('/employee');
        }
      });
});

app.post('/addcheckin',isLoggedIn,function(req,res){
    var aadhar = req.body.aadhar;
    req.session.aflag=0;
    sql = "select * from reservations where customer_aadhar ="+mysql.escape(aadhar)+'and TentativeCheckInDate <= ' + mysql.escape(today())+' and TentativeCheckOutDate >='+mysql.escape(today())+' and customer_aadhar not in (select customer_aadhar from checksin);';
    con.query(sql, function (err, result, fields) {
        if (err) 
            throw err;
        else if(result.length!=0)
        {   
            var a = moment(result[0].TentativeCheckInDate,'YYYY/MM/DD');
            var b = moment(result[0].TentativeCheckOutDate,'YYYY/MM/DD');
            var diffDays = b.diff(a, 'days')+1;
            console.log(diffDays);
            sql = "select * from rooms natural join roomtypedetails where room_number = "+mysql.escape(result[0].room_number)+';';
            con.query(sql, function (err, result, fields) {
                if (err) 
                    throw err;
                else{
                    console.log(result);
                    var total = diffDays * result[0].cost_per_night;
                    sql = "insert into invoice values ("+mysql.escape(aadhar)+',"Booking fees",'+mysql.escape(total)+');';
                    con.query(sql, function (err, result, fields) {
                    if (err) 
                        throw err;
                    else {
                        sql = "insert into checksin values ("+mysql.escape(aadhar)+','+mysql.escape(req.session.user)+','+mysql.escape(today())+');';
                    con.query(sql, function (err, result, fields) {
                    if (err) 
                        throw err;
                    else 
                          res.redirect('/success');       
                        });
                    }      
                        });
                    
                }
            });   
            
        }
        else{
            res.redirect('/error/301');
        }
   
                    
      });
        
   
});

app.post('/addinvoice',isLoggedIn,function(req,res){
    var aadhar = req.body.aadhar;
    var service_description = req.body.service_description;
    var Charge = req.body.Charge;
    sql = "select * from reservations where customer_aadhar ="+mysql.escape(aadhar)+' and customer_aadhar in (select customer_aadhar from checksin) and customer_aadhar not in (select customer_aadhar from checksout);';
    con.query(sql, function (err, result, fields) {
        if (err) 
            throw err;
        else if(result.length!=0)
        { 
            sql = "insert into invoice values("+mysql.escape(aadhar)+','+mysql.escape(service_description)+','+mysql.escape(Charge)+');';
            con.query(sql, function (err, result, fields) {
            if (err) 
                throw err;  
            else 
                res.redirect('/employee');
            });
        }
        else{
            res.redirect('/error/301');
        }
   
                    
      });
        
   
});

app.post('/generateinvoice',isLoggedIn,function(req,res){
    var aadhar = req.body.aadhar;
    sql = "select * from reservations where customer_aadhar ="+mysql.escape(aadhar)+' and customer_aadhar in (select customer_aadhar from checksin) and customer_aadhar not in (select customer_aadhar from checksout);';
    con.query(sql, function (err, result, fields) {
        if (err) {console.log(err)
            throw err;}
            
        else if(result.length!=0)
        { 
            sql = "select * from invoice where customer_aadhar ="+mysql.escape(aadhar)+';';
            con.query(sql, function (err, result, fields) {
                if (err) {console.log(err)
                    throw err;}
            else 
              {
                sql = "select sum(Charge) as total from invoice where customer_aadhar ="+mysql.escape(aadhar)+';';
                con.query(sql, function (err, result2, fields) {
                    if (err) {console.log(err)
                        throw err;}
                else {
                    req.session.aadhar = aadhar;
                    res.render('generateinvoice.ejs',{result:result , total:result2[0].total });   
                }            
                    });
              }     
            });
        }
        else{
            res.redirect('/error/301');
        }
   
                    
      });
        
   
});

app.post('/addcheckout',isLoggedIn,function(req,res){
        sql = "insert into checksout values ("+mysql.escape(req.session.aadhar)+','+mysql.escape(req.session.user)+','+mysql.escape(today())+');';
        con.query(sql, function (err, result, fields) {
        if (err) 
            throw err;
        else 
              res.redirect('/success');       
            });            
});




app.listen(3000 ,()=>{
    console.log("Server started at port 3000");
});
