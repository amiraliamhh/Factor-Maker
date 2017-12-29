var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var PDFDocument = require('pdfkit');
var fs = require('fs');
var jimp = require('jimp');
var locImg = require('google-maps-image-api');
var qrImage = require('qr-image');
var qrcode = require('qrcode');
var mmmagic = require('mmmagic').Magic;
var path = require('path');
var pdf2img = require('pdf2img');

var pdfDocBeforeAddingQRCode = new PDFDocument;
var pdfDocAfterAddingQRCode = new PDFDocument;

var magic = new mmmagic();

var filename = Date.now();
var pathToOriginalImage = "./assets/Factor-empty.jpg";

var constants = {
  eyeTicketCodeW: 700,
  eyeTicketCodeH: 200,
  customerW: 1400,
  customerH: 1300,
  titleW: 1000,
  titleH: 1300,
  phoneNumberW: 300,
  phoneNumberH: 1300,
  addressW: 1400,
  addressH: 1550,
  dateW: 1400,
  dateH: 1920,
  startingDateW: 900,
  startingDateH: 1920,
  endingDateW: 280,
  endingDateH: 1920
}

pdf2img.setOptions({
  type: 'png',                                // png or jpg, default jpg 
  size: 1024,                                 // default 1024 
  density: 600,                               // default 600 
  outputdir: './assets', // output folder, default null (if null given, then it will create folder name same as file name) 
  outputname: 'qrcode',                         // output file name, dafault null (if null given, then it will create image name same as input name) 
  page: null                                  // convert selected page, default null (if null given, then it will convert all pages) 
});

// var qr_svg = qrImage.image('fuck', {type: 'png'});
// qr_svg.pipe(fs.createWriteStream("./assets/fuck.png"))



jimp.read(pathToOriginalImage, function(err, factor) {
  if (err) throw err;
  jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(function(font) {
    factor.print(font, constants.eyeTicketCodeW, constants.eyeTicketCodeH, "1235")
          .print(font, constants.customerW, constants.customerH, "Customer")
          .print(font, constants.titleW, constants.titleH, "Title")
          .print(font, constants.phoneNumberW, constants.phoneNumberH, "phoneNumber")
          .print(font, constants.addressW, constants.addressH, "address")
          .print(font, constants.dateW, constants.dateH, "date")
          .print(font, constants.startingDateW, constants.startingDateH, "starting date")
          .print(font, constants.endingDateW, constants.endingDateH, "ending date")
          .write(generatePathToImage(filename), function (err) {
            if (err) throw err;            
            qrcode.toDataURL('http://techter.pw', { version: 2 }, function (err, url) {
              if (err) throw err;
              console.log(url);
              qrcode.toFile(generatePathToPNG(filename), "url", {
                color: {
                  dark: '#000',  // Blue dots
                  light: '#0000' // Transparent background
                }
              }, function (err) {
                if (err) throw err
                console.log('done')
                pdfDocBeforeAddingQRCode.pipe(fs.createWriteStream(generatePathToPDF(filename)));
                pdfDocBeforeAddingQRCode.image(generatePathToImage(filename), 0, 0, {width: 500});
                pdfDocBeforeAddingQRCode.image(generatePathToPNG(filename), 170, 110, {width: 200});
                pdfDocBeforeAddingQRCode.end();
              })
            })
          })
          })
  })
  // .then(function () {
  //     //   qrcode.toDataURL('http://techter.pw', { version: 2 }, function (err, url) {
  //     //     if (err) throw err;
  //     //     console.log(url);
  //     //     qrcode.toFile(generatePathToPNG(filename), "url", {
  //     //       color: {
  //     //         dark: '#00F',  // Blue dots
  //     //         light: '#0000' // Transparent background
  //     //       }
  //     //     }, function (err) {
  //     //       if (err) throw err
  //     //       console.log('done')
  //     //     })
  //     //   })
  //     // })
  //     // .then(function () {
  //     //   pdfDocBeforeAddingQRCode.pipe(fs.createWriteStream(generatePathToPDF(filename)));
  //     //   pdfDocBeforeAddingQRCode.image(generatePathToImage(filename), 0, 0, {width: 500});
  //     //   pdfDocBeforeAddingQRCode.image("./assets/1514558961080.png", 200, 200, {width: 500});
  //     //   pdfDocBeforeAddingQRCode.end();
  //     // })
  //     // .catch(function (error) {
  //     //   console.log("Error accured 1: " + error);
  //     // })
  // })
  .catch(function (error) {
    console.log("Error accured 2: " + error);
  })

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function generatePathToImage(filename) {
  var path = "./assets/" + filename + ".jpeg";
  return path;
}

function generatePathToPDF(filename) {
  var path = "./pdf/" + filename + ".pdf";
  return path;
}

function generatePathToPNG(filename) {
  var path = "./assets/" + filename + ".png";
  return path;
}

function generatePathToQRCodeImage(filename) {
  var path = "./assets/" + filename + "-qrcode.png";
  return path;
}

function addImageToImage(lat, long, width, filename, pdfkitInstance) {
  return new promise(function (resolve, reject) {
    try {
      pdfkitInstance.pipe(fs.createWriteStream(generatePathToPDF(filename)));
      pdfkitInstance.image(generatePathToImage(filename) , lat, long, {width: width});
      pdfkitInstance.end();
      var image = {
        name: generatePathToImage(Date.now())
      }
      resolve(image);
    } catch (err) {
      reject(err);
    }    
  });
}

module.exports = app;
