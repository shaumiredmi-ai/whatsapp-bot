const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const TOKEN = "ABC123"; // ganti token kamu

console.log("Memulai bot WhatsApp...");

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "./session"
    }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote"
        ]
    }
});


// QR
client.on("qr", async (qr) => {

    const link = await QRCode.toDataURL(qr);

    console.log("\nSCAN QR:");
    console.log(link);

});


// READY
client.on("ready", () => {

    console.log("✅ BOT SIAP DAN TERHUBUNG");

});


// AUTO REPLY TEST
client.on("message_create", async (msg) => {

    if (msg.body.toLowerCase() === "ping") {

        await msg.reply("pong 🟢 bot aktif");

    }

});


/*
================================
API SEND MESSAGE
================================
*/
app.get("/send", async (req,res)=>{

    const token = req.query.token;
    const nomor = req.query.to;
    const pesan = req.query.msg;

    if(token !== TOKEN){

        return res.send("Token salah");

    }

    if(!nomor || !pesan){

        return res.send("Parameter kurang");

    }

    try{

        await client.sendMessage(nomor+"@c.us", pesan);

        res.send("Pesan terkirim");

    }catch(e){

        res.send("Gagal: "+e.message);

    }

});


app.listen(PORT, ()=>{

    console.log("API aktif di port", PORT);

});


client.initialize();
