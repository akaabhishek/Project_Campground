const express=require('express');
const app=express();
const path=require('path');

app.set('view engine', 'ejs');      // ejs WILL BE RESPONSIBLE FOR LOOKING INTO THE 'views' folder for templates to render
app.set('views', path.join(__dirname, 'views'));    // JOINING PATH WITH VIEWS DIRECTORY
app.get('/', (req, res)=>{
    res.render('home')
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})