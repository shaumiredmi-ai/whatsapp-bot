const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client();

client.on("qr", (qr) => {
    console.log("Scan QR ini:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Bot siap!");
});

client.initialize();
