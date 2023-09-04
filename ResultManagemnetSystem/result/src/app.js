require('dotenv').config();
const express= require('express');
const hbs=require('hbs');
const app= express();
const path=require("path")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const cookieParser=require('cookie-parser');
require("./db/conn");
// const auth=require("./middlewares/auth")
const Signup=require("./models/teacher_signup")
const studentData=require("./models/student_login");
const auth = require('./middlewares/auth');
const view_path=path.join(__dirname,"/templates/views")
const partial_path=path.join(__dirname,"/templates/partials")

const static_path=path.join(__dirname,"/public")
app.use(express.static(static_path));
app.use(cookieParser());
app.set('view engine','hbs');
app.set('views',view_path )
hbs.registerPartials(partial_path);
app.use(express.urlencoded({extended:false}))

app.get("",(req, res)=>{
    res.render("index")
});

app.get("/teacher",(req, res)=>{
    res.render("teacher_login")
});

app.get("/logout",auth,async(req,res)=>{
    try {
        res.clearCookie("Login_Jwt");
        await req.user.save();
        res.redirect("/teacher");
    } catch (error) {
      res.status(401).send(error);  
    }
})

app.get("/student",(req, res)=>{
    res.render("student_result")
});
app.get("/teacher_signup",(req,res)=>{
    res.render("teacher_signup")
})
app.get("/addResult",auth,(req,res)=>{
    res.render("addResult")
})

app.get("/studentDashboard",auth,async(req,res)=>{
    try {
        
        const stud=await studentData.find({});
        res.status(201).render("student_dashboard",{stud})
        // console.log(`cookie is ${req.cookies.Login_Jwt}`)
    } catch (error) {
        res.send(error)
    }
})
app.post("/addResult",async(req,res)=>{
    try {
        const result=new studentData({
            Rollno:req.body.Rollno,
            Name:req.body.Name,
            Dob:req.body.Dob,
            Score:req.body.Score
        })
        const stud_data=await result.save();
        // const stud=await studentData.find({});
        
        res.status(201).redirect("/studentDashboard");
    } catch (error) {
        res.status(400).send(error)
    }
})

app.post("/teacher_signup",async(req,res)=>{
    try {
       
       const registerEmployee=new Signup({
        User_name:req.body.User_name,
        password:req.body.password
       })

       const token= await registerEmployee.generateAuthToken();
       
       //password hashing middleware
       
       res.cookie("Login_Jwt",token,{
        expires:new Date(Date.now()+120000),
        httpOnly:true
       })
       console.log(cookie);

       const registered=await registerEmployee.save();
       res.status(201).render("teacher_login")

    } catch (error) {
        res.status(400).send(error);
    }
})
app.post("/teacher", async(req, res)=>{
    try {
        const User_name=req.body.User_name;
        const password=req.body.password;
        const useremail=await Signup.findOne({User_name:User_name});
        // const stud=await studentData.find({});
        const isMatch=bcrypt.compare(password, useremail.password);

        const token= await useremail.generateAuthToken();
       

        res.cookie("Login_Jwt",token,{
            expires:new Date(Date.now()+120000),
            httpOnly:true
           })
        if(isMatch){
            res.status(201).redirect("/studentDashboard");
            
        }
        else{
            res.send("invalid email or password")
        }


    } catch (error) {
        res.status(400).send("invalid email or password")
    }
});
app.post("/student", async(req, res)=>{
    try {
        const Rollno=req.body.Rollno;
        const Dob=req.body.Dob;
        const student=await studentData.findOne({Rollno:Rollno});
        
        if(Dob===student.Dob){
            res.status(201).render("showResult",{student});
            
        }
        else{
            res.send("invalid DOB")
        }


    } catch (error) {
        res.status(400).send("invalid Roll Number or DOB")
    }
});

app.delete('/api/results/delete/:id', async (req, res) => {

    try {

        const deletedStudent = await studentData.findByIdAndDelete(req.params.id);

        if (!deletedStudent) {
            return res.status(404).send('Student not found');
        }
        res.send('Student deleted successfully');
    } catch (error) {
        res.status(500).send('An error occurred while deleting the student');
    }
});



app.get('/editStudent/:id',auth, async (req, res) => {

    try {

        const student = await studentData.findById(req.params.id);

        if (!student) {

            return res.status(404).send('Student not found');

        }

        res.render('editStudent', { student }); 

    } catch (error) {

        res.status(500).send('An error occurred while rendering the edit form');

    }

});

 



app.post('/editStudent/:id', async (req, res) => {

    try {

        const updatedStudent = await studentData.findByIdAndUpdate(

            req.params.id,

            {

                Rollno: req.body.Rollno,

                Name: req.body.Name,

                Dob: req.body.Dob,

                Score: req.body.Score

            },

            { new: true } 

        );
        if (!updatedStudent) {
            return res.status(404).send('Student not found');
        }
        res.redirect("/studentDashboard");
    } catch (error) {

        res.status(500).send('An error occurred while updating the student');

    }

});

app.get("/",(req, res)=>{
    res.send("Hello, welcome!")
});
app.listen(3000,()=>{
console.log("app started at 3000")

})