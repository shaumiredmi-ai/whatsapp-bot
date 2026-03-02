const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

const app = express();

const API_TOKEN = "medanusatb17";

let latestQR = null;
let isReady = false;

console.log("Memulai WhatsApp bot...");


/* =============================
   INIT CLIENT
============================= */

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


/* =============================
   QR EVENT
============================= */

client.on("qr", async (qr) => {

    latestQR = await QRCode.toDataURL(qr);

    console.log("\n===== SCAN QR INI =====");
    console.log(latestQR);
    console.log("=======================\n");

});


/* =============================
   READY EVENT
============================= */

client.on("ready", () => {

    isReady = true;
    latestQR = null;

    console.log("✅ WhatsApp Connected");

});


/* =============================
   DISCONNECTED
============================= */

client.on("disconnected", (msg) => {

    isReady = false;
    console.log("❌ WA disconnected:", msg);

});


/* =============================
   STATUS API
============================= */

app.get("/", (req, res) => {

    res.json({
        status: isReady ? "connected" : "not_connected",
        qr: latestQR
    });

});


/* =============================
   SEND MESSAGE API
============================= */

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


        /* =============================
           SUPPORT GROUP & NOMOR
        ============================= */

        let chatId;

        if (number.includes("@g.us"))
            chatId = number;

        else if (number.includes("@c.us"))
            chatId = number;

        else
            chatId = number + "@c.us";


        /* =============================
           SEND TANPA LINK PREVIEW
        ============================= */

        await client.sendMessage(
            chatId,
            message,
            {
                linkPreview: false
            }
        );


        res.json({
            status: true,
            message: "terkirim"
        });

    }
    catch (e) {

        console.log("ERROR:", e);

        res.json({
            status: false,
            error: e.message
        });

    }

});


/* =============================
   START SERVER
============================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("API running on port", PORT);

});


/* =============================
   START CLIENT
============================= */

client.initialize();
