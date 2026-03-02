const { Client, LocalAuth } = require("whatsapp-web.js");

const phoneNumber = "628XXXXXXXXXX"; // GANTI nomor kamu

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

client.on("loading_screen", () => {
    console.log("Loading WhatsApp...");
});

client.on("ready", () => {
    console.log("✅ Bot siap!");
});

client.initialize();

// paksa pairing code setelah start
setTimeout(async () => {
    try {
        const code = await client.requestPairingCode(phoneNumber);
        console.log("\n===============================");
        console.log("PAIRING CODE:");
        console.log(code);
        console.log("===============================\n");
    } catch (e) {
        console.log("Sudah login / gagal:", e.message);
    }
}, 5000);
