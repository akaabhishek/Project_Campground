const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const joi=require('joi')        // JS VALIDATOR TOOL......... used to validate .body errors with ease
const {campgroundSchema, reviewSchema}=require('./validateSchema.js')
const catchAsync=require('./errorHandlers/catchAsync');
const ExpressError = require('./errorHandlers/ExpressError');
const methodOverride=require('method-override')
const Campground=require('./models/campground');
const { string } = require('joi');
const Review=require('./models/review');

const campgrounds=require('./routes/campgrounds')

mongoose.connect('mongodb://localhost:27017/YelpCampDB', {
    useNewUrlParser:true, 
    useUnifiedTopology:true, 
    useCreateIndex: true, 
    useFindAndModify: true})
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
app.use(express.static(path.join(__dirname, 'public')))

const validateCampgrounds=(req, res, next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

const validateReview=(req, res, next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}


app.get('/', (req, res)=>{
    res.render('home')
})

app.use('/campgrounds', campgrounds)

app.get('/campground/:id/edit', catchAsync( async (req, res)=>{
    const campground=await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

app.put('/campgrounds/:id',validateCampgrounds, async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect(`/campground/${campground._id}`)
})

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res)=>{
    // res.send('Thanks for leaving a review');
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res)=>{
    const { id, reviewId }=req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))

app.all('*', (req, res, next)=>{            // THIS IS TO CHECK IF THE URL IS CORRECT OR NOT FOR ALL API REQUESTS
    next(new ExpressError('Page not found', 404))
})


app.use((err, req, res,next)=>{
    const{statusCode=500}=err;
    if(!err.message){
        err.message="Oops! Something went wrong"
    }
    res.status(statusCode).render('errorTemplate.ejs', {err});
    // res.send('Something went wrong')
})


// app.get('/makeCG', async (req,res)=>{
//     const camp=new Campground({title:'Zostel Camp', price:'500 per night', location:'Dalhousie', description:'Cheap camping'})
//     await camp.save();
//     res.send(camp)
// })


app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})