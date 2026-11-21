const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
  firstName: {type: String, required: true, minlength: 2, trim: true,},
  lastName: {type: String, required:true, minlength: 2, trim:true},
  email:{type:String, required:true, unique: true, lowercase: true, trim: true,},
  password: {type: String, required: true, trim: true,},
  role: { type: String, enum: ['developer', 'owner', 'admin'], default: 'developer' },
},{timestamps:true})

// userSchema.pre("save", async function(){
//   if(!this.isModified("password")) return 
//   try{
//     const hashedPassword = await bcrypt.hash(this.password, 10)
//     this.password = hashedPassword
//   }catch(err){
//     console.log(err);
//   }
// })


const userModel = mongoose.model('users', userSchema)

module.exports = userModel