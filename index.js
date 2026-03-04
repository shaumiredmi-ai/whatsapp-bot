const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

const app = express();

const API_TOKEN = "medanusatb17";

let isReady = false;
let qrImage = "";

console.log("Starting WhatsApp bot...");

/* ==============================
   INIT CLIENT
============================== */

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "./session"
    }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    }
});


/* ==============================
   QR EVENT
============================== */

client.on("qr", async (qr) => {

    console.log("QR GENERATED");

    qrImage = await QRCode.toDataURL(qr);

});


/* ==============================
   READY
============================== */

client.on("ready", () => {

    console.log("WHATSAPP CONNECTED");

    isReady = true;
    qrImage = "";

});


/* ==============================
   DISCONNECTED
============================== */

client.on("disconnected", () => {

    console.log("WA DISCONNECTED");

    isReady = false;

});


/* ==============================
   HOME (QR PAGE)
============================== */

app.get("/", (req, res) => {

    if (isReady) {

        res.send("<h2>WhatsApp Connected</h2>");

    } else if (qrImage !== "") {

        res.send(`
        <h2>Scan QR WhatsApp</h2>
        <img src="${qrImage}" width="300"/>
        <p>Refresh jika QR berubah</p>
        `);

    } else {

        res.send("Menunggu QR dibuat... refresh halaman");

    }

});


/* ==============================
   SEND MESSAGE
============================== */

app.get("/send", async (req, res) => {

    try {

        if (req.query.token !== API_TOKEN)
            return res.json({ status: false });

        if (!isReady)
            return res.json({ status: false, message: "WA belum connect" });

        const number = req.query.to;
        const message = req.query.msg;

        let chatId = number.includes("@") ? number : number + "@c.us";

        await client.sendMessage(chatId, message);

        res.json({ status: true });

    } catch (e) {

        console.log(e);

        res.json({ status: false });

    }

});


/* ==============================
   SERVER
============================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("API running on port", PORT);

});


/* ==============================
   START CLIENT
============================== */

client.initialize();
