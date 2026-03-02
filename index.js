const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

console.log("Memulai bot...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--single-process"
        ]
    }
});

client.on("qr", async (qr) => {
    console.log("QR diterima, membuat link...");

    const url = await QRCode.toDataURL(qr);

    console.log("\nBUKA LINK INI DI BROWSER:\n");
    console.log(url);
    console.log("\nLalu scan dari WhatsApp HP\n");
});

client.on("ready", () => {
    console.log("BOT SIAP ✅");
});

client.initialize();
