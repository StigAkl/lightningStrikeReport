const fs = require("fs"); 
const logfile = "logs/strike.json"
const email = process.env.EMAIL; 
const pass = process.env.PASS; 
const nodemailer = require("nodemailer"); 


executeJob(); 

async function executeJob() {

    let data = JSON.parse(fs.readFileSync(logfile));  

    let closest = data.closest; 

    if(closest < 10000) {
        await sendMail("Closest lightning strike detected last 24 hours was " + closest + " km's from Bergen at (lat,lon): " + data.lat + ", " + data.lon); 

        let resetData = {
            lastData: "0000",
            closest: 9999999,
            lon: 2000,
            lat: 2000
        }
        fs.writeFileSync(logfile, JSON.stringify(resetData)); 
    }
}

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
