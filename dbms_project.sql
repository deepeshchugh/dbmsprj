CREATE TABLE  customer  (    fname  varchar(20) NOT NULL,
    lname  varchar(20) NOT NULL,
    aadhar  decimal(14,0) NOT NULL,
    address  varchar(100) NOT NULL,
    dob  date NOT NULL,
   PRIMARY KEY ( aadhar ) ) ;


CREATE TABLE  customercontactdetails  ( 
       aadhar  decimal(14,0) NOT NULL,
    phone_number  decimal(12,0) NOT NULL,
   PRIMARY KEY ( aadhar , phone_number ) ,
 foreign key(aadhar) references customer(aadhar) on delete cascade on update cascade) ;

 CREATE TABLE  roomtypedetails  (   
      room_type  varchar(20) NOT NULL,
    cost_per_night  int(11) NOT NULL,
    size  int(11) NOT NULL,
   PRIMARY KEY ( room_type ) ) ;

CREATE TABLE  rooms  (    
    room_number  int(11) NOT NULL primary key,
    room_type  varchar(20) NOT NULL ,
 foreign key (room_type) references roomtypedetails(room_type)) ;

CREATE TABLE  employeetypedetails  (    
    job_type  varchar(30) NOT NULL,
    base_salary  int(11) NOT NULL,
    bonuses_in_percentage  decimal(3,2) NOT NULL DEFAULT '0.00',
   PRIMARY KEY ( job_type ) ) ;

CREATE TABLE  employee  (   
     id  int(11) NOT NULL,
    fname  varchar(20) NOT NULL,
    lname  varchar(20) NOT NULL,
    address  varchar(100) NOT NULL,
    job_type  varchar(30) NOT NULL,
    Password  varchar(30) NOT NULL,
   PRIMARY KEY ( id ) ,
 foreign key (job_type) references employeetypedetails(job_type)) ;

CREATE TABLE  employeecontactdetails  (   
     id  int(11) NOT NULL,
    phone_number  decimal(12,0) NOT NULL,
   PRIMARY KEY ( id , phone_number ),
    foreign key(id) references employee(id)) ;

CREATE TABLE  employeemanagers  (    
    employee_id  int(11) NOT NULL,
    manager_id  int(11) DEFAULT NULL,
   PRIMARY KEY ( employee_id ),
   foreign KEY ( manager_id ) references employee(id),
    foreign key (employee_id) references employee(id)) ;

CREATE TABLE  reservations  (    
    customer_aadhar  decimal(14,0) NOT NULL,
    TentativeCheckInDate  date NOT NULL,
    TentativeCheckOutDate  date NOT NULL,
    room_number  int(11) NOT NULL,
   PRIMARY KEY ( customer_aadhar ,TentativeCheckInDate ) ,
    foreign key(room_number) references rooms(room_number),
    foreign key(customer_aadhar) references customer(aadhar) on delete cascade on update cascade);


CREATE TABLE  checksin  (    
    customer_aadhar  decimal(14,0) NOT NULL,
    employee_id  int(11) NOT NULL,
    check_in_date  date NOT NULL,
   PRIMARY KEY ( customer_aadhar , check_in_date ),
   foreign KEY  ( employee_id ) references employee(id),
    foreign key(customer_aadhar) references customer(aadhar) on delete cascade on update cascade ) ;


CREATE TABLE  checksout  (   
     customer_aadhar  decimal(14,0) NOT NULL,
    employee_id  int(11) NOT NULL,
    check_out_date  date NOT NULL,
   PRIMARY KEY ( customer_aadhar , check_out_date ),
   foreign KEY  ( employee_id ) references employee(id) ,
    foreign key(customer_aadhar) references customer(aadhar) on delete cascade on update cascade ) ;

CREATE TABLE  invoice  (    
    customer_aadhar  decimal(14,0) NOT NULL,
    service_description  varchar(100) NOT NULL,
    Charge  decimal(10,0) NOT NULL,
 foreign key(customer_aadhar) references customer(aadhar) on delete cascade on update cascade ) ;
