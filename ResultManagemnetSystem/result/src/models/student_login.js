const mongoose=require('mongoose')
const student_data=new mongoose.Schema({
    Rollno:{
        type: Number,
        required: true
    },
    Name:{
        type:String,
        required:true
    },
    Dob:{
        type:String,
        required:true
    },
    Score:{
        type:Number,
        required:true
    }
})

const studentData= new mongoose.model("Student",student_data);
module.exports=studentData;