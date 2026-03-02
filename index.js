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


// =======================
// QR CODE → LINK
// =======================
client.on("qr", async (qr) => {

    console.log("QR diterima...");

    try {

        const link = await QRCode.toDataURL(qr);

        console.log("\n==============================");
        console.log("BUKA LINK INI DI BROWSER:");
        console.log(link);
        console.log("==============================\n");

    } catch (err) {

        console.log("Gagal buat QR:", err.message);

    }

});


// =======================
// READY
// =======================
client.on("ready", async () => {

    console.log("✅ BOT SIAP DAN TERHUBUNG");

    // kirim pesan test ke nomor sendiri
    const number = "6288901808073@c.us";

    try {

        await client.sendMessage(number, "✅ Bot Railway aktif");

        console.log("Pesan test terkirim");

    } catch {

        console.log("Tidak bisa kirim pesan test");

    }

});


// =======================
// AUTH SUCCESS
// =======================
client.on("authenticated", () => {

    console.log("✅ Login sukses");

});


// =======================
// DISCONNECT
// =======================
client.on("disconnected", (msg) => {

    console.log("❌ Disconnect:", msg);

});


// =======================
// AUTO REPLY
// =======================
client.on("message", async msg => {

    if (msg.body.toLowerCase() === "ping") {

        await msg.reply("pong 🟢 bot aktif");

    }

});


// =======================
// START
// =======================
client.initialize();
