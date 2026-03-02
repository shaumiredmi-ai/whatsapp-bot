const { Client, LocalAuth } = require("whatsapp-web.js");

const phoneNumber = "6288901808073"; // wajib pakai tanda kutip buka & tutup

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

client.on("ready", () => {
    console.log("✅ Bot siap!");
});

client.on("authenticated", () => {
    console.log("✅ Login berhasil");
});

client.on("auth_failure", msg => {
    console.log("❌ Auth gagal:", msg);
});

console.log("Memulai bot...");
client.initialize();

setTimeout(async () => {
    try {
        console.log("Meminta pairing code...");
        const code = await client.requestPairingCode(phoneNumber);

        console.log("\n==============================");
        console.log("PAIRING CODE ANDA:");
        console.log(code);
        console.log("==============================\n");

    } catch (err) {
        console.log("❌ Error pairing:", err.message);
    }
}, 15000);
