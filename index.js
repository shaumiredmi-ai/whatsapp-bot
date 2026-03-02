const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

const app = express();

const API_TOKEN = "medanusatb17";

let latestQR = null;
let isReady = false;

console.log("Memulai WhatsApp bot...");

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "./session"
    }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    }
});

client.on("qr", async (qr)=>{

    latestQR = await QRCode.toDataURL(qr);

    console.log("SCAN QR:");
    console.log(latestQR);

});

client.on("ready", ()=>{

    isReady = true;
    console.log("WhatsApp Connected");

});


app.get("/", (req,res)=>{

    res.json({
        status: isReady ? "connected" : "not_connected",
        qr: latestQR
    });

});


app.get("/send", async (req,res)=>{

    try{

        if(req.query.token !== API_TOKEN)
            return res.json({status:false,message:"token salah"});

        if(!isReady)
            return res.json({status:false,message:"WA belum login"});

        const chatId = req.query.to + "@c.us";

        await client.sendMessage(chatId, req.query.msg);

        res.json({status:true});

    }catch(e){

        res.json({status:false,error:e.message});

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{

    console.log("API running on port",PORT);

});


client.initialize();
