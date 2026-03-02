const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

const app = express();
app.use(express.json());

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
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote"
        ]
    }
});


// QR event
client.on("qr", async (qr) => {

    latestQR = await QRCode.toDataURL(qr);

    console.log("===== QR LINK =====");
    console.log(latestQR);
    console.log("===================");

});


// ready event
client.on("ready", () => {

    isReady = true;
    console.log("✅ WhatsApp Connected");

});


// status endpoint
app.get("/", (req, res) => {

    res.json({
        status: isReady ? "connected" : "not_connected",
        qr: latestQR
    });

});


// send endpoint
app.get("/send", async (req, res) => {

    try {

        const token = req.query.token;
        const number = req.query.to;
        const message = req.query.msg;

        if (token !== API_TOKEN)
            return res.json({ status:false, message:"token salah" });

        if (!isReady)
            return res.json({ status:false, message:"WA belum connect" });

        if (!number || !message)
            return res.json({ status:false, message:"parameter kurang" });

        const chatId = number.includes("@")
            ? number
            : number + "@c.us";

        await client.sendMessage(chatId, message);

        res.json({
            status:true,
            message:"terkirim"
        });

    } catch(e) {

        console.log(e);

        res.json({
            status:false,
            error:e.message
        });

    }

});


// IMPORTANT: Railway port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("API running on port", PORT);

});


client.initialize();
