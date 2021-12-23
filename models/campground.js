const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const campGroundSchema=new Schema({
    title:String,
    price:String,
    image:String,
    description:String,
    location:String,
    population:String
});

module.exports=mongoose.model('Campground', campGroundSchema)
