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

    console.log("QR GENERATED");

});


/* =============================
   READY EVENT
============================= */

client.on("ready", () => {

    isReady = true;
    latestQR = null;

    console.log("WhatsApp Connected");

});


/* =============================
   DISCONNECTED
============================= */

client.on("disconnected", () => {

    isReady = false;

    console.log("WA disconnected");

});


/* =============================
   QR / STATUS PAGE
============================= */

app.get("/", (req, res) => {

    if (isReady) {

        res.send("<h2>WhatsApp Connected</h2>");

    } else if (latestQR) {

        res.send(`
        <h2>Scan QR WhatsApp</h2>
        <img src="${latestQR}" width="300"/>
        <p>Refresh jika QR berubah</p>
        `);

    } else {

        res.send("Menunggu QR dibuat... refresh halaman");

    }

});


/* =============================
   SEND MESSAGE API
============================= */

app.get("/send", async (req, res) => {

    try {

        if (req.query.token !== API_TOKEN)
            return res.json({ status: false });

        if (!isReady)
            return res.json({ status: false, message: "WA belum login" });

        const number = req.query.to;
        const message = req.query.msg;

        let chatId = number.includes("@") ? number : number + "@c.us";

        await client.sendMessage(chatId, message, { linkPreview:false });

        res.json({ status: true });

    }
    catch (e) {

        console.log(e);

        res.json({ status: false });

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
