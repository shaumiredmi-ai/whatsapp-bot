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
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process"
        ]
    }
});

client.on("qr", (qr) => {
    console.log("=== SCAN QR INI ===");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ Bot WhatsApp siap!");
});

client.on("message", msg => {
    if (msg.body === "ping") {
        msg.reply("pong ✅");
    }
});

client.initialize();
