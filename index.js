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
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            "--no-zygote",
            "--no-first-run",
            "--disable-features=site-per-process",
            "--single-process"
        ]
    }
});


// QR EVENT
client.on("qr", async (qr) => {

    latestQR = await QRCode.toDataURL(qr);

    console.log("\n===== SCAN QR LINK INI =====");
    console.log(latestQR);
    console.log("============================\n");

});


// READY EVENT
client.on("ready", () => {

    isReady = true;
    latestQR = null;

    console.log("✅ WhatsApp Connected");

});


// DISCONNECT
client.on("disconnected", (msg) => {

    isReady = false;
    console.log("WA disconnected:", msg);

});


// STATUS API
app.get("/", (req, res) => {

    res.json({
        status: isReady ? "connected" : "not_connected",
        qr: latestQR
    });

});


// SEND MESSAGE API
app.get("/send", async (req, res) => {

    try {

        if (req.query.token !== API_TOKEN)
            return res.json({
                status: false,
                message: "token salah"
            });

        if (!isReady)
            return res.json({
                status: false,
                message: "WhatsApp belum login"
            });

        const number = req.query.to;
        const message = req.query.msg;

        if (!number || !message)
            return res.json({
                status: false,
                message: "parameter kurang"
            });

        const chatId = number + "@c.us";

        await client.sendMessage(chatId, message);

        res.json({
            status: true,
            message: "terkirim"
        });

    } catch (e) {

        res.json({
            status: false,
            error: e.message
        });

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("API running on port", PORT);

});


client.initialize();
