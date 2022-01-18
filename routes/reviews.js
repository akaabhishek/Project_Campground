// const express=require('express');
// // const router=express.Router({mergeParams:true});
// const router=express();
// const Campground=require('../models/campground');
// const Review=require('../models/review');
// const{validateReview, isLoggedIn, isReviewAuthor}=require('../midddleware');
// const ExpressError=require('../errorHandlers/ExpressError')
// const catchAsync=require('../errorHandlers/catchAsync')



// router.post('/campgrounds/:id/reviews',isLoggedIn, validateReview, catchAsync(async (req, res)=>{
//     // res.send('Thanks for leaving a review');
//     const campground=await Campground.findById(req.params.id);
//     const review=new Review(req.body.review)
//     review.author=req.user._id
//     campground.reviews.push(review)
//     await review.save()
//     await campground.save()
//     req.flash('success', 'Added your review, thanks !')
//     res.redirect(`/campgrounds/${campground._id}`)
// }))

// router.delete('/campgrounds/:id/reviews/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(async(req, res)=>{
//     const { id, reviewId }=req.params;
//     await Campground.findByIdAndUpdate(id, {$pull:{reviews : reviewId}})
//     await Review.findByIdAndDelete(reviewId);
//     req.flash('success', 'Review Deleted ')
//     res.redirect(`/campgrounds/${id}`)
// }))