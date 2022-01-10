const express=require('express')
// const app=express();
const router=express.Router();
const ExpressError = require('../errorHandlers/ExpressError');
const {campgroundSchema}=require('../validateSchema.js')
const Campground=require('../models/campground');
const catchAsync=require('../errorHandlers/catchAsync');

const validateCampgrounds=(req, res, next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

router.get('/', catchAsync( async (req, res)=>{
    const campgrounds=await Campground.find({})
    // res.send(camp);
    res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', (req,res)=>{        // THIS .get SECTION MUST BE ABOVE FROM THE SECTION WITH .get campgrounds/:id BECAUSE OTHERWISE IT CANT FIND ANYTHING WITH THE NEW ID
    res.render('campgrounds/new')
})

router.post('/',validateCampgrounds, catchAsync( async(req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    
    const campground=new Campground(req.body.campground)
    await campground.save();
    // res.send(req.body)
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.get('/:id', catchAsync( async (req,res)=>{
    const campground=await Campground.findById(req.params.id).populate('reviews')
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


router.delete('/:id', catchAsync( async (req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))



module.exports=router;