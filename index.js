const { Client, LocalAuth } = require("whatsapp-web.js");

const phoneNumber = "6288901808073; // nomor kamu

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

client.on("ready", () => {
    console.log("✅ Bot siap!");
});

client.on("authenticated", () => {
    console.log("✅ Sudah login");
});

client.on("auth_failure", msg => {
    console.log("❌ Auth gagal:", msg);
});

client.initialize();

setTimeout(async () => {
    try {
        const code = await client.requestPairingCode(phoneNumber);
        console.log("\n================================");
        console.log("PAIRING CODE ANDA:");
        console.log(code);
        console.log("================================\n");
    } catch (err) {
        console.log("Tidak bisa ambil pairing code:", err.message);
    }
}, 10000);
