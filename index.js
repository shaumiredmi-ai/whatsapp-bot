const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();

const API_TOKEN = "medanusatb17";

let isReady = false;

console.log("Starting WhatsApp bot...");

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

            "--disable-extensions",
            "--disable-background-networking",
            "--disable-sync",
            "--disable-default-apps",

            "--mute-audio",
            "--no-first-run",

            "--disable-features=site-per-process",

            "--js-flags=--max-old-space-size=128"
        ]
    }

});


/* =============================
   QR
============================= */

client.on("qr", () => {

    console.log("Scan QR di Railway logs atau endpoint /");

});


/* =============================
   READY
============================= */

client.on("ready", async () => {

    isReady = true;

    console.log("WhatsApp Connected");

    const page = client.pupPage;

    await page.setCacheEnabled(false);

    await page.setRequestInterception(true);

    page.on("request", (req) => {

        const type = req.resourceType();

        if (
            type === "image" ||
            type === "media" ||
            type === "font"
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

client.on("disconnected", () => {

    console.log("WA disconnected");

    isReady = false;

    setTimeout(() => {

        console.log("Reconnect...");

        client.initialize();

    }, 10000);

});


/* =============================
   STATUS
============================= */

app.get("/", (req, res) => {

    res.json({
        status: isReady ? "connected" : "not_connected"
    });

});


/* =============================
   SEND MESSAGE
============================= */

app.get("/send", async (req, res) => {

    try {

        if (req.query.token !== API_TOKEN)
            return res.json({ status:false });

        if (!isReady)
            return res.json({ status:false });

        const number = req.query.to;
        const message = req.query.msg;

        if (!number || !message)
            return res.json({ status:false });

        let chatId = number.includes("@") ? number : number + "@c.us";

        await client.sendMessage(chatId, message);

        res.json({ status:true });

    }
    catch (e) {

        console.log(e);

        res.json({ status:false });

    }

});


/* =============================
   MEMORY MONITOR
============================= */

setInterval(() => {

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    console.log("RAM:", Math.round(used), "MB");

}, 60000);


/* =============================
   SERVER
============================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("API running on port", PORT);

});


/* =============================
   START CLIENT
============================= */

client.initialize();
