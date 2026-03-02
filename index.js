const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

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

client.on("qr", (qr) => {
    console.log("SCAN QR INI:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("BOT SIAP DAN TERHUBUNG");
});

client.on("authenticated", () => {
    console.log("LOGIN BERHASIL");
});

client.on("auth_failure", msg => {
    console.log("LOGIN GAGAL:", msg);
});

client.initialize();
