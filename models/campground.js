const mongoose=require('mongoose');
const { campgroundSchema } = require('../validateSchema');
const Review=require('./review')
const Schema=mongoose.Schema;

const campGroundSchema=new Schema({
    title:String,
    price:Number,
    image:String,
    description:String,
    location:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});


campGroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            _id:{                                                       // This is a query middleware and i used it here so that it can delete all the reviews related to a campground from the database when a campground is deleted
                $in:doc.reviews
            }
        })
    }
})


module.exports=mongoose.model('Campground', campGroundSchema)


