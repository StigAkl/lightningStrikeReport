const axios = require("axios"); 
const converter = require("xml-js"); 
const nodemailer = require("nodemailer"); 
const email = process.env.EMAIL;
const pass = process.env.PASS;  

console.log(email)
const latLocation = 60; 
const lonLocation = 5; 
axios.get("https://api.met.no/weatherapi/lightning/1.0/available").then((res) => {
    
    const data = converter.xml2json(res.data)

    let obj = JSON.parse(data); 

    let elms = obj.elements[0]; 

    let requestUrl = elms.elements[elms.elements.length-1].elements[1].elements[0].text; 


    axios.get(requestUrl).then((res) => {
        let data = res.data.split("\n"); 
        let lon = ""; 
        let lat = ""; 

        let shortestDistance = 9999999; 
        let shortestLat = 99999; 
        let shortestLon = 99999; 
        data.forEach(element => {
            let splitData = element.split(" "); 

            if(splitData.length > 1) {
                lat = splitData[8]
                lon = splitData[9]

                let distance = calcDistance(lat, lon, latLocation, lonLocation); 

                if(distance < shortestDistance) {
                    shortestDistance = distance; 
                    shortestLat = lat; 
                    shortestLon = lon; 
                }

                console.log(distance); 
            }
        });

        if(shortestDistance < 1000) {
            let mailText = `Nearby Lightning Strike detected ${shortestDistance} kilometers away at location ${shortestLat},${shortestLon}`;
            sendMail(mailText); 
        }
    })
})


async function sendMail(data) {
    let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
            user: email,
            pass: pass
        }
    });


    try {
    let info = await transporter.sendMail({
        from: "Lightning information <"+email+">",
        to: email,
        subject: "Lightning Strike Information",
        text: data
    });

    console.log("Message sent", info); 

} catch(e) {
    console.log("Error sending email: ", e); 
}
}

function calcDistance(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }
