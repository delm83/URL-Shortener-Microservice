require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const validUrl = require('valid-url');
const nanoId = require('nano-id');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});

let Schema = mongoose.Schema;
let urlSchema = new Schema({
  original_url: String,
  short_url: String
});

let URL = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/shorturl', async (req, res)=>{

  let nano_Id = nanoId();
  if (!validUrl.isWebUri(req.body.url)) 
  {res.json({error: 'invalid url'})} 
  else {
       let inputURL = await URL.findOne({original_url: req.body.url})
       if (inputURL) {
          res.json({original_url: inputURL.original_url, short_url: inputURL.short_url})} 
       else 
         {
          inputURL = new URL({original_url: req.body.url, short_url: nano_Id})
          await inputURL.save()
          res.json({original_url: inputURL.original_url, short_url: inputURL.short_url})
     }
 }
});

app.get('/api/shorturl/:short_url?', async (req, res)=>{
  let outputURL = await URL.findOne({short_url: req.params.short_url})
  outputURL ? res.redirect(outputURL.original_url)
  : res.json({error: 'not found'})
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
