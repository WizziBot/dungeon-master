const colours = require('./colours.json');

Object.entries(colours).forEach(col=>{
    console.log(col[0]);
    console.log(col[1]);
})