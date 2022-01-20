const Campground=require('../models/campground');
const {cloudinary}=require('../cloudinary')

module.exports.index=async (req, res)=>{
    const campgrounds=await Campground.find({})
    // res.send(camp);
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm=(req,res)=>{        
    
    res.render('campgrounds/new')
}

module.exports.createCampground=async(req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    const campground=new Campground(req.body.campground)
    campground.images=req.files.map(f=>({url:f.path, filename:f.filename}))
    campground.author=req.user._id;
    await campground.save();
    // res.send(req.body)
    req.flash('success', 'SUCCESSFULLY CREATED A NEW CAMPGROUND')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground=async (req,res)=>{
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
}

module.exports.editCampground=async (req, res)=>{
    const{id}=req.params;
    const campground=await Campground.findById(id)
    if(!campground){
        req.flash('error', `Cannot find what you're looking for`)
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}

module.exports.updateCampground=async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path, filename:f.filename}));                   // DOING THIS SO IN ORDER TO NOT PASS THE ENTIRE ARRAY AND JUST TAKING THE DATA FROM THE ARRAY AND PASSING IT TO PUSH IN NEXT STEP
    campground.images.push(...imgs)                                                     // DOING THIS AND ABOVE STEP IN ORDER TO PREVENT OVERRITING 
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){     // LOOPING OVER ALL IMAGES WITH THE SAME FILE NAMES AS OF FILENAMES OF DELETING IMAGES
            await cloudinary.uploader.destroy(filename);      // IN THIS STEP, DELETING IMAGES EVEN FROM CLOUDINAR SERVER
        }
        await campground.updateOne({$pull : {images :{filename : {$in : req.body.deleteImages}}}})      // pull operator is used for removing elements from an array
    }
    req.flash('success', 'SUCCESSFULLY Updated')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground=async (req,res)=>{
    const{id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground')
    res.redirect('/campgrounds');
}

