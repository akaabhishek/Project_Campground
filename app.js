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
const session=require('express-session')
const flash=require('connect-flash')
const campgroundsRoutes=require('./routes/campgrounds')
const userRoutes=require('./routes/users')
const passport=require('passport');
const req = require('express/lib/request');
const LocalStrategy=require('passport-local')
const User=require('./models/user')
const {isLoggedIn, isAuthor, validateCampgrounds, validateReview, isReviewAuthor}=require('./midddleware');
const { findById } = require('./models/review');


mongoose.connect('mongodb://localhost:27017/YelpCampDB', {
    useNewUrlParser:true, 
    useUnifiedTopology:true, 
    // useCreateIndex: true,        // THIS IS NOT SUPPORTED IN MONGOOSE NOW
    // useFindAndModify: true       // THIS IS ALSO NOT SUPPORTED IN MONGOOSE NOW
})
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

const sessionConfig={
    secret:'itShouldBeASecret',
    resave:false,       // USED FOR SESSION DEPRICATED WARNINGS
    saveUninitialized:true,      // USED FOR SESSION DEPRICATED WARNINGS
    cookie:{
        httpOnly:true,      // IF the httpOnly FLAG IS INCLUDED THE COOKIE CANNOT BE ACCESSED THROUGH CLIENT SIDE SCRIPT.
        expires:Date.now() + (1000*60*60*24*7),         // THIS MEANS COOKIE WILL EXPIRE AFTER A WEEK
        maxAge:(1000*60*60*24*7)
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())            // USED TO HOW WE STORE A USER IN THE SESSION
passport.deserializeUser(User.deserializeUser())        // USED TO HOW WE LOGOUT A USER FROM THE SESSION

app.use((req, res, next)=>{
    res.locals.currentUser=req.user
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})

// const validateCampgrounds=(req, res, next)=>{
//     const {error}=campgroundSchema.validate(req.body);
//     if(error){
//         const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
//         throw new ExpressError(msg, 400)
//     }else{
//         next();
//     }
// }

// const isAuthor=async (req, res, next)=>{
//     const{id}=req.params;
//     const campground=await Campground.findById(id);
//     if(!campground.author.equals(req.user._id)){
//         req.flash('error', `Sorry, you don't have permission to do that`)
//         return res.redirect(`/campgrounds/${id}`)
//     }
//     next();
// }

// const validateReview=(req, res, next)=>{
//     const {error}=reviewSchema.validate(req.body);
//     if(error){
//         const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
//         throw new ExpressError(msg, 400)
//     }else{
//         next();
//     }
// }


app.get('/', (req, res)=>{
    res.render('home')
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundsRoutes)

app.get('/campground/:id/edit',isLoggedIn, isAuthor, catchAsync( async (req, res)=>{
    const{id}=req.params;
    const campground=await Campground.findById(id)
    if(!campground){
        req.flash('error', `Cannot find what you're looking for`)
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}))

app.put('/campgrounds/:id',isLoggedIn, isAuthor, validateCampgrounds, async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    req.flash('success', 'SUCCESSFULLY Updated')
    res.redirect(`/campground/${campground._id}`)
})

app.post('/campgrounds/:id/reviews',isLoggedIn, validateReview, catchAsync(async (req, res)=>{
    // res.send('Thanks for leaving a review');
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review)
    review.author=req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Added your review, thanks !')
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(async(req, res)=>{
    const { id, reviewId }=req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted ')
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