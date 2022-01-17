const express=require('express')
// const app=express();
const router=express.Router();
const ExpressError = require('../errorHandlers/ExpressError');
const {campgroundSchema}=require('../validateSchema.js')
const Campground=require('../models/campground');
const catchAsync=require('../errorHandlers/catchAsync');
const {isLoggedIn}=require('../midddleware')

const validateCampgrounds=(req, res, next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

const isAuthor=async (req, res, next)=>{
    const{id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', `Sorry, you don't have permission to do that`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

router.get('/', catchAsync( async (req, res)=>{
    const campgrounds=await Campground.find({})
    // res.send(camp);
    res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', isLoggedIn, (req,res)=>{        // THIS .get SECTION MUST BE ABOVE FROM THE SECTION WITH .get campgrounds/:id BECAUSE OTHERWISE IT CANT FIND ANYTHING WITH THE NEW ID
    
    res.render('campgrounds/new')
})

router.post('/', validateCampgrounds, catchAsync( async(req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    
    const campground=new Campground(req.body.campground)
    campground.author=req.user._id;
    await campground.save();
    // res.send(req.body)
    req.flash('success', 'SUCCESSFULLY CREATED A NEW CAMPGROUND')
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.get('/:id', catchAsync( async (req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author')        // populate(), a Mongoose method that you can use to essentially link documents across collections.
    if(!campground){
        req.flash('error', `Cannot find what you're looking for`)
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}))

// app.get('/campground/:id/edit', catchAsync( async (req, res)=>{
//     const campground=await Campground.findById(req.params.id)
//     res.render('campgrounds/edit', {campground})
// }))

// router.put('/:id',validateCampgrounds, async (req,res)=>{
//     const {id}=req.params;
//     const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
//     res.redirect(`/campground/${campground._id}`)
// })


router.delete('/:id',isLoggedIn, isAuthor, catchAsync( async (req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground')
    res.redirect('/campgrounds');
}))



module.exports=router;