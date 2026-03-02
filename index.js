const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

console.log("Memulai bot...");

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
            "--disable-gpu"
        ]
    }
});

client.on("qr", async (qr) => {

    console.log("QR diterima...");

    const link = await QRCode.toDataURL(qr);

    console.log("\n==============================");
    console.log("BUKA LINK INI DI BROWSER:");
    console.log(link);
    console.log("==============================\n");
});

client.on("ready", () => {
    console.log("✅ BOT SIAP DAN TERHUBUNG");
});

client.on("authenticated", () => {
    console.log("✅ Login sukses");
});

client.on("disconnected", (msg) => {
    console.log("❌ Disconnect:", msg);
});

client.initialize();
