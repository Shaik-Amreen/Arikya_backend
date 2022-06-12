const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/demo",
  {
    useNewUrlParser: true, useUnifiedTopology: true, //make this true
    autoIndex: true, useCreateIndex: true
  }).then((result) => {
    console.log('Mongodb connection succeeded ')
  }).catch((err) => {
    console.log('error while connecting Mongodb' + err)
  })

// mongodb://127.0.0.1:27017/mitspcell
//mongodb+srv://placement:placement@cluster0.i5cpa.mongodb.net/mitspcell?retryWrites=true&w=majority
//mongodb://127.0.0.1:27017/mitspcell
//mongodb+srv://harsha:<password>@cluster0.cfwgd.mongodb.net/arikya?retryWrites=true&w=majority