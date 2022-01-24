const mongoose=require('mongoose');
const { campgroundSchema } = require('../validateSchema');
const Review=require('./review')
const Schema=mongoose.Schema;

const options={toJSON:{virtuals:true}};

const campGroundSchema=new Schema({
    title:String,
    price:Number,
    geometry:{
        type:{
            type:String,
            enum:['Point'],     // LOCATION.TYPE MUST BE A POINT
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    images:[
        {
            url:String,
            filename:String
        }
    ],
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

campGroundSchema.virtual('properties.popupMarkup').get(function (){         // THIS ISN'T WORKING NOW FOR SOME REASON, ITS USE IS TO DISPLAY NAME OF THE CLUSTER ON THE CAMPGROUND WHEN CLICKED A CLUSTER ON THE CLUSTER MAP, AND THEN TO REDIRECT DIRECTLY TO THAT CAMPGROUND FROM CLUSTER MAP ONLY
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})

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


