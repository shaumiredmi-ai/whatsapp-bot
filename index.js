const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const puppeteer = require("puppeteer");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

client.on("qr", (qr) => {
    console.log("Scan QR ini:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Bot siap!");
});

client.initialize();
