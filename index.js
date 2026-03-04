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

            "--disable-extensions",
            "--disable-background-networking",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding",
            "--disable-sync",
            "--disable-default-apps",

            "--disable-component-update",
            "--disable-domain-reliability",
            "--disable-notifications",

            "--mute-audio",
            "--no-first-run",

            "--disable-features=site-per-process",

            "--js-flags=--max-old-space-size=128"
        ]
    }

});


/* =============================
   QR EVENT
============================= */

client.on("qr", async (qr) => {

    latestQR = await QRCode.toDataURL(qr);

    console.log("===== SCAN QR =====");

});


/* =============================
   READY EVENT
============================= */

client.on("ready", async () => {

    isReady = true;
    latestQR = null;

    console.log("✅ WhatsApp Connected");

    const page = client.pupPage;

    await page.setCacheEnabled(false);

    await page.setRequestInterception(true);

    page.on("request", (req) => {

        const type = req.resourceType();

        if (
            type === "image" ||
            type === "media" ||
            type === "font" ||
            type === "stylesheet"
        ) {
            req.abort();
        } else {
            req.continue();
        }

    });

});


/* =============================
   DISCONNECTED
============================= */

client.on("disconnected", (msg) => {

    console.log("❌ WA disconnected:", msg);

    isReady = false;

    setTimeout(() => {
        console.log("Reconnect...");
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

        await client.sendMessage(chatId, message, { linkPreview:false });

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
   MEMORY MONITOR
============================= */

setInterval(() => {

    const mem = process.memoryUsage();

    const used = mem.heapUsed / 1024 / 1024;

    console.log("Memory:", Math.round(used) + " MB");

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
