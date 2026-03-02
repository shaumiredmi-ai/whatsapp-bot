const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

console.log("Memulai WhatsApp bot...");

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

// tampilkan QR sebagai LINK gambar
client.on("qr", async (qr) => {
    try {
        const qrLink = await QRCode.toDataURL(qr);

        console.log("\n==============================");
        console.log("COPY LINK INI KE BROWSER:");
        console.log(qrLink);
        console.log("==============================\n");

    } catch (err) {
        console.log("Error membuat QR:", err.message);
    }
});

client.on("ready", () => {
    console.log("✅ WhatsApp BOT TERHUBUNG!");
});

client.on("authenticated", () => {
    console.log("✅ Login berhasil");
});

client.on("disconnected", (reason) => {
    console.log("❌ Terputus:", reason);
});

client.initialize();
