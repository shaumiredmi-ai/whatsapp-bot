const express = require("express")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const QRCode = require("qrcode")

const app = express()

const API_TOKEN = "medanusatb17"

let sock = null
let isReady = false
let qrImage = null


/* =============================
START WHATSAPP
============================= */

async function startWA(){

    const { state, saveCreds } = await useMultiFileAuthState("session")

    sock = makeWASocket({

        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Railway","Chrome","1.0"]

    })

    sock.ev.on("creds.update", saveCreds)


sock.ev.on("connection.update", async (update) => {

    const { connection, lastDisconnect, qr } = update

    if (qr) {
        console.log("QR RECEIVED")
        qrImage = await QRCode.toDataURL(qr)
    }

    if (connection === "open") {

        console.log("WHATSAPP CONNECTED")
        isReady = true
        qrImage = null

    }

    if (connection === "close") {

        isReady = false

        const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !== 401

        console.log("WA DISCONNECTED")

        if (shouldReconnect) {
            console.log("RECONNECTING...")
            startWA()
        }

    }

})


/* =============================
HOME
============================= */

app.get("/",(req,res)=>{

    if(isReady){

        res.send("WhatsApp Connected")

    }

    else if(qrImage){

        res.send(`
        <h2>SCAN QR WHATSAPP</h2>
        <img src="${qrImage}" width="300">
        `)

    }

    else{

        res.send("Starting WhatsApp...")

    }

})


/* =============================
SEND MESSAGE
============================= */

app.get("/send", async (req,res)=>{

    try{

        if(req.query.token !== API_TOKEN)
            return res.json({status:false})

        if(!isReady)
            return res.json({status:false,message:"WA belum connect"})

        let number = req.query.to
        const message = req.query.msg

        if(!number || !message)
            return res.json({status:false})


        number = number.replace(/\D/g,"")

        if(number.startsWith("0"))
            number = "62"+number.slice(1)

        const jid = number+"@s.whatsapp.net"


        await sock.sendMessage(jid,{
            text:message
        })


        res.json({
            status:true
        })

    }
    catch(e){

        console.log("SEND ERROR:",e)

        res.json({
            status:false
        })

    }

})


/* =============================
HEALTH CHECK
============================= */

setInterval(()=>{

    const mem = process.memoryUsage().heapUsed/1024/1024

    console.log("READY:",isReady,"RAM:",Math.round(mem),"MB")

},60000)


/* =============================
SERVER
============================= */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

    console.log("API RUNNING PORT",PORT)

})


startWA()
