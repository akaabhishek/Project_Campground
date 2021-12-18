const express=require('express');
const app=express();
const path=require('path');
const Campground=require('./models/campground')

const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/YelpCampDB', {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log("-----MONGOOSE CONNECTION OPEN-----")
})
.catch(err=>{
    console.log("-----ERROR IN MONGOOSE CONNECTION-----")
    console.log(err)
})
const db=mongoose.connection;       // JUST DOING IT FOR SHORTCUT, SO I CAN JUST USE db INSTEAD OF mongoose.connection EVERYTIME I WORK WITH ITS DATABASE


app.set('view engine', 'ejs');      // ejs WILL BE RESPONSIBLE FOR LOOKING INTO THE 'views' folder for templates to render
app.set('views', path.join(__dirname, 'views'));    // JOINING PATH WITH VIEWS DIRECTORY

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/makeCG', async (req,res)=>{
    const camp=new Campground({title:'Zostel Camp', price:'500 per night', location:'Dalhousie', description:'Cheap camping'})
    await camp.save();
    res.send(camp)
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})