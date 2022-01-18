const {campgroundSchema, reviewSchema}=require('./validateSchema.js')
const ExpressError=require('./errorHandlers/ExpressError')
const Campground=require('./models/campground');
const Review=require('./models/review')

module.exports.isLoggedIn=(req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        req.flash('error', 'You need to be signed in')
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampgrounds=(req, res, next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

module.exports.isAuthor=async (req, res, next)=>{
    const{id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', `Sorry, you don't have permission to do that`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isReviewAuthor=async (req, res, next)=>{
    const{id, reviewId}=req.params;
    const review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', `Sorry, you don't have permission to do that`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview=(req, res, next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',')     // ',' is used if in case there will be more than one message........we will join them with ,
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}