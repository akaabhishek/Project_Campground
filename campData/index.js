//THIS FILE WILL TAKE RANDOM DATA FROM CITIES.JS AND HELPERS.JS USING MATH.RANDOM FUNCTION AND WILL PUSH THIS DATA INTO DATABASE.
//NOTE- SINCE IT IS TAKING RANDOM DATA SO AFTER RUNNING THIS FILE AGAIN AND AGAIN IN NODE TERMINAL DATA PUSHED WILL BE DIFFERENT FROM THE DATA PUSHED EARLIER, BUT THE DATA WILL BE FROM SAME FILES, CITIES AND HELPERS



const cities=require('./cities');
const Campground=require('../models/campground')
const {places, descriptors}=require('./helpers');

const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/YelpCampDB', {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log("-----MONGOOSE CONNECTION OPEN-----")
})
.catch(err=>{
    console.log("-----ERROR IN MONGOOSE CONNECTION-----")
    console.log(err)
})
const db=mongoose.connection; 

const sample = array =>array[Math.floor(Math.random()*12)]  // ONLY 12 ENTERIES ARE AVAILABLE IN HELPERS.JS

const campDataDB = async()=>{
    await Campground.deleteMany({});        // HERE I DELETED EVERYTHING THAT I INSERTED MANUALLY IN THE DATABASE FOR CONNECTION CHECKING.
    // const c = new Campground({title:'Ark field'})
    // await c.save();
    for(let i=0;i<50;i++){
        const rand1000=Math.floor(Math.random()*1000);  // SINCE 1000 ENTERIES ARE AVAILABLE IN CITIES.JS
        const camp=new Campground({
            location:`${cities[rand1000].city}, ${cities[rand1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}
campDataDB().then(()=>{
    mongoose.connection.close()
})