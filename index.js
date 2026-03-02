const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

const app = express();
app.use(express.json());

const API_TOKEN = "usatb17"; // contoh: lambaro123

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

let latestQR = null;
let isReady = false;


// QR → LINK
client.on("qr", async (qr) => {

    latestQR = await QRCode.toDataURL(qr);

    console.log("\nSCAN QR LINK INI:");
    console.log(latestQR);
    console.log("");

});


// READY
client.on("ready", () => {

    isReady = true;
    console.log("✅ BOT SIAP");

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

    const token = req.query.token;
    const number = req.query.to;
    const message = req.query.msg;

    if (token !== API_TOKEN) {

        return res.json({
            status: false,
            message: "Token salah"
        });

    }

    if (!isReady) {

        return res.json({
            status: false,
            message: "WhatsApp belum login"
        });

    }

    try {

        const chatId = number + "@c.us";

        await client.sendMessage(chatId, message);

        res.json({
            status: true,
            message: "Pesan terkirim"
        });

    } catch (err) {

        res.json({
            status: false,
            error: err.message
        });

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("API jalan di port", PORT);

});


client.initialize();
