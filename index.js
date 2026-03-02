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

    console.log("\n=======================");
    console.log("SCAN QR DARI LINK INI:");
    console.log(link);
    console.log("=======================\n");

});


// READY
client.on("ready", async () => {

    console.log("✅ BOT SIAP DAN TERHUBUNG");

});


// AUTO REPLY TEST
client.on("message_create", async (msg) => {

    if (msg.body.toLowerCase() === "ping") {

        await msg.reply("pong 🟢 bot aktif");

        console.log("Reply terkirim");

    }

});


/*
====================================
FUNGSI KIRIM PESAN (UNTUK WEBSITE)
====================================
*/
async function kirimPesan(nomor, pesan){

    try{

        const chatId = nomor + "@c.us";

        await client.sendMessage(chatId, pesan);

        console.log("Pesan terkirim ke", nomor);

    }catch(e){

        console.log("Gagal kirim:", e.message);

    }

}


// contoh test otomatis saat start
setTimeout(()=>{

    // ganti nomor kamu
    // kirimPesan("628xxxxxxxxxx", "Test dari bot");

},15000);



client.initialize();
