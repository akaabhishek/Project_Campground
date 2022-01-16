const mongoose=require('mongoose')
const Schema=mongoose.Schema
const passportLocalMongoose=require('passport-local-mongoose')

const UserSchema=new Schema({
    email: {
        type: String,
        required:true,
        unique:true
    }
})

UserSchema.plugin(passportLocalMongoose);       // THIS WILL ADD USERNAME, HASH AND SALT TO STORE THE username,hashed password and salt values,    ADDITIONALY THIS WILL ADD SOME METHODS TO THE SCHEMA

module.exports=mongoose.model('User', UserSchema)