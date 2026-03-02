const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
    authStrategy: new LocalAuth(),
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

// pairing code TANPA QR
client.on("qr", async () => {
    const phoneNumber = "628XXXXXXXXXX"; // ganti dengan nomor WhatsApp kamu
    try {
        const code = await client.requestPairingCode(phoneNumber);
        console.log("================================");
        console.log("PAIRING CODE WHATSAPP:");
        console.log(code);
        console.log("================================");
        console.log("Buka WhatsApp > Linked devices > Link with phone number");
    } catch (err) {
        console.error("Gagal buat pairing code:", err);
    }
});

client.on("ready", () => {
    console.log("✅ Bot siap dan terhubung!");
});

client.on("authenticated", () => {
    console.log("✅ Berhasil login WhatsApp");
});

client.on("auth_failure", msg => {
    console.error("❌ Auth gagal:", msg);
});

client.on("disconnected", reason => {
    console.log("⚠️ WhatsApp terputus:", reason);
});

client.initialize();
