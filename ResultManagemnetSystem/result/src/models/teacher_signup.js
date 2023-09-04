const mongoose=require('mongoose')
const bcrypt=require("bcryptjs")
const jwt= require("jsonwebtoken")
const teacher_data=new mongoose.Schema({
    User_name:{
        type: String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

teacher_data.methods.generateAuthToken= async function(){
    try {
        const token= jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY)
        this.tokens=this.tokens.concat({token:token});
        console.log(token)
        await this.save();
        return token;
    } catch (error) {
        res.send("Error occured")
    }
}

teacher_data.pre("save",async function(next){
    if(this.isModified("password")){
    this.password=await bcrypt.hash(this.password,10);
    }
    next();
})

const Signup= new mongoose.model("Signup",teacher_data);
module.exports=Signup;