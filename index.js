const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu"
        ]
    }
});

client.on("qr", (qr) => {
    console.log("=========== QR CODE ===========");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("WhatsApp BOT SIAP");
});

client.on("disconnected", () => {
    console.log("Bot disconnected");
});

client.initialize();
