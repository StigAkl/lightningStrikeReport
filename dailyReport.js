const axios = require("axios"); 
const converter = require("xml-js"); 
const fs = require("fs"); 
const logfile = "logs/strike.json"
const latLocation = 60; 
const lonLocation = 5; 
const email = process.env.EMAIL; 
const pass = process.env.PASS; 

axios.get("https://api.met.no/weatherapi/lightning/1.0/available").then((res) => {
    
    const data = converter.xml2json(res.data)
    let obj = JSON.parse(data); 
    let elms = obj.elements[0]; 
    let logFileData = readFromLog(); 

    let lastAvailableUrl = elms.elements[elms.elements.length-2].elements[1].elements[0].text; 
    let lastAvailableDate = elms.elements[elms.elements.length-2].elements[0].elements[1].elements[0].text

    if(lastAvailableDate!==logFileData.lastData) {

        console.log("New")
        console.log(lastAvailableDate + " : " + logFileData.lastData)

        let newLogData = {
            lastData: lastAvailableDate,
            closest: logFileData.closest
        }

        axios.get(lastAvailableUrl).then((res) => {

            let lastData = res.data.split("\n"); 

            lastData.forEach(element => {
                let splitData = element.split(" "); 

                if(splitData.length > 1) {
                    lat = splitData[8]; 
                    lon = splitData[9]; 

                    let distance = calcDistance(lat, lon, latLocation, lonLocation);  
                    if(newLogData.closest > distance) {
                        newLogData.closest=distance;
                    }
                }
            })

            writeToLog(newLogData); 
        }); 
    } 
})

function parseISOString(s) {
    var b = s.split(/\D+/);

    console.log(b); 
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
  }

function writeToLog(data) {
    fs.writeFileSync(logfile, JSON.stringify(data))
}

function readFromLog() {
    let data = fs.readFileSync(logfile); 
    return JSON.parse(data); 
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
      return parseFloat(d.toFixed(2));
    }

function toRad(Value) 
{
    return Value * Math.PI / 180;
}