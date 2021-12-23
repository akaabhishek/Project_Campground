const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override')
const Campground=require('./models/campground')

mongoose.connect('mongodb://localhost:27017/YelpCampDB', {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log("-----MONGOOSE CONNECTION OPEN-----")
})
.catch(err=>{
    console.log("-----ERROR IN MONGOOSE CONNECTION-----")
    console.log(err)
})
const db=mongoose.connection;       // JUST DOING IT FOR SHORTCUT, SO I CAN JUST USE db INSTEAD OF mongoose.connection EVERYTIME I WORK WITH ITS DATABASE


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');      // ejs WILL BE RESPONSIBLE FOR LOOKING INTO THE 'views' folder for templates to render
app.set('views', path.join(__dirname, 'views'))   // JOINING PATH WITH VIEWS DIRECTORY

app.use(express.urlencoded({extended:true}))    // THIS LINE IS USED FOR PARSING THE POST REQUEST BODY OTHERWISE THE POST REQUEST BODY WILL BE BLANK
app.use(methodOverride('_method'))

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/campgrounds', async (req, res)=>{
    const campgrounds=await Campground.find({})
    // res.send(camp);
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (req,res)=>{        // THIS .get SECTION MUST BE ABOVE FROM THE SECTION WITH .get campgrounds/:id BECAUSE OTHERWISE IT CANT FIND ANYTHING WITH THE NEW ID
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id', async (req,res)=>{
    const campground=await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground})
})

app.post('/campgrounds', async(req,res)=>{
    const campground=new Campground(req.body.campground)
    await campground.save();
    // res.send(req.body)
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id/edit', async (req, res)=>{
    const campground=await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
})


app.put('/campgrounds/:id', async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campground/${campground._id}`)
})


app.delete('/campgrounds/:id', async (req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})



// app.get('/makeCG', async (req,res)=>{
//     const camp=new Campground({title:'Zostel Camp', price:'500 per night', location:'Dalhousie', description:'Cheap camping'})
//     await camp.save();
//     res.send(camp)
// })


app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})