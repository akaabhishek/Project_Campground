const express=require('express')
const router=express.Router();
const ExpressError = require('../errorHandlers/ExpressError');
const campgrounds=require('../controllers/campgrounds')
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

router.get('/', catchAsync(campgrounds.index))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)           // THIS .get SECTION MUST BE ABOVE FROM THE SECTION WITH .get campgrounds/:id BECAUSE OTHERWISE IT CANT FIND ANYTHING WITH THE NEW ID

router.post('/', validateCampgrounds, catchAsync(campgrounds.createCampground))

router.get('/:id', catchAsync(campgrounds.showCampground))

// app.get('/campground/:id/edit', catchAsync( async (req, res)=>{
//     const campground=await Campground.findById(req.params.id)
//     res.render('campgrounds/edit', {campground})
// }))

// router.put('/:id',validateCampgrounds, async (req,res)=>{
//     const {id}=req.params;
//     const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
//     res.redirect(`/campground/${campground._id}`)
// })


router.delete('/:id',isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))



module.exports=router;