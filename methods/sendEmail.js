/**
 *
 * Run:
 *
 */
 const mailjet = require('node-mailjet').apiConnect(
    "c75f193a60e4988fcc38e3cf42364a06",
    "a4c00d83a28e6907533cf786e1581a85"
  )

  function Otp(){
    return Math.floor(Math.random()*1000)
  }
  
  module.exports = function(email,callback){
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'adhiman111111@gmail.com',
            Name: 'Me',
          },
          To: [
            {
              Email: email,
              Name: 'You',
            },
          ],
          Subject: "One more step",
          TextPart: 'Greetings from Anuj!',
          HTMLPart:
            `<h3>Dear passenger, welcome to ${Otp()} </h3><br />May the delivery force be with you!`,
        },
      ],
    })
    request
      .then(result => {
        console.log(result.body)
        callback(null,result.body)
      })
      .catch(err => {
        console.log(err.statusCode)
        callback(err,null)
      })

  }