const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

client.on("ready", () => {
    console.log("Bot siap!");
});

client.on("authenticated", () => {
    console.log("WhatsApp terhubung!");
});

client.on("auth_failure", msg => {
    console.error("Auth gagal:", msg);
});

client.initialize();
