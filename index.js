const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");

console.log("Memulai bot WhatsApp...");

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
            "--disable-gpu",
            "--single-process",
            "--no-zygote"
        ]
    }
});


// QR → LINK
client.on("qr", async (qr) => {

    const link = await QRCode.toDataURL(qr);

    console.log("\nSCAN QR DARI LINK INI:");
    console.log(link);
    console.log("");

});


// READY
client.on("ready", async () => {

    console.log("✅ BOT SIAP DAN TERHUBUNG");

});


// AUTO REPLY (INI YANG BENAR)
client.on("message_create", async (msg) => {

    // hanya balas pesan dari diri sendiri / chat biasa
    if (msg.body.toLowerCase() === "ping") {

        await msg.reply("pong 🟢 bot aktif");

        console.log("Reply terkirim");

    }

});


client.initialize();
