var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');


var transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            user: 'coworkersapp',
            clientId: '332968660228-i2tmq679hnecda6kb4hh2cvligtqmh21.apps.googleusercontent.com',
            clientSecret: '-ciht-ka_eAuYw_NgIZzz_7u',
            refreshToken: '1/RoRlulFc0Zp4PuWnQRlaMaqhfUcC0Ys0W2eNYylcQBQ'
            
//             clientId: '897872809102-s30dba6huhvk4730393bics29p74bblm.apps.googleusercontent.com',
//             clientSecret: 'byp__V-EFn_gfTn67en9ZYAd',
//             refreshToken: '1/NYoM3XYhL2WJeQa4fmMt3gWIMzTNBUFC13GU9Ze3gRQ'
        })
    }
});

exports.sendPassword = function(result) {

    var text = 'your password is:' + result.password +'\n please change it in you profile';
    var mailOptions = {
        to: 'manderlai@mail.ru', // list of receivers
        subject: 'Email Example', // Subject line
        text: text //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
};

