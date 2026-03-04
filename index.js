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

    webVersionCache: {
        type: "none"
    },

    puppeteer: {
        headless: true,
        args: [

            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--single-process",

            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-extensions",
            "--disable-sync",
            "--disable-default-apps",

            "--metrics-recording-only",
            "--mute-audio",
            "--no-first-run",
            "--disable-features=site-per-process"
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

    console.log("Reconnecting...");

    setTimeout(() => {
        client.initialize();
    }, 5000);

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

        let chatId;

        if (number.includes("@g.us"))
            chatId = number;
        else if (number.includes("@c.us"))
            chatId = number;
        else
            chatId = number + "@c.us";

        /* =============================
           SEND MESSAGE + RETRY
        ============================= */

        try {

            await client.sendMessage(
                chatId,
                message,
                { linkPreview: false }
            );

        } catch (err) {

            console.log("Retry send...", err.message);

            await new Promise(r => setTimeout(r, 2000));

            await client.sendMessage(
                chatId,
                message,
                { linkPreview: false }
            );

        }

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
   AUTO CLEAN MEMORY
============================= */

setInterval(() => {

    if (global.gc) {
        global.gc();
    }

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    console.log("Memory used:", Math.round(used) + " MB");

}, 60000);


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
