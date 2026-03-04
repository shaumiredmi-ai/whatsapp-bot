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
logger: P({ level:"silent" }),
browser: ["Ubuntu","Chrome","20.0"]

})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async(update)=>{

const { connection, qr, lastDisconnect } = update


/* =============================
QR
============================= */

if(qr){

console.log("QR GENERATED")

qrImage = await QRCode.toDataURL(qr)

}


/* =============================
CONNECTED
============================= */

if(connection === "open"){

console.log("WHATSAPP CONNECTED")

isReady = true
qrImage = null

}


/* =============================
DISCONNECTED
============================= */

if(connection === "close"){

isReady = false

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log("WA DISCONNECTED")

if(shouldReconnect){

console.log("RECONNECTING IN 8s...")

setTimeout(()=>{
startWA()
},8000)

}

}

})

}


/* =============================
STATUS
============================= */

app.get("/",(req,res)=>{

res.json({
status:isReady ? "connected":"not_connected"
})

})


/* =============================
QR PAGE
============================= */

app.get("/qr",(req,res)=>{

if(qrImage){

res.send(`
<h2>Scan QR WhatsApp</h2>
<img src="${qrImage}" width="300">
`)

}else{

res.send("QR belum tersedia, refresh halaman")

}

})


/* =============================
SEND MESSAGE
============================= */

app.get("/send", async(req,res)=>{

try{

if(req.query.token !== API_TOKEN)
return res.json({status:false,message:"token salah"})

if(!isReady)
return res.json({status:false,message:"WA belum connect"})

const number = req.query.to
const message = req.query.msg

if(!number || !message)
return res.json({status:false,message:"parameter kurang"})

const jid = number.replace(/\D/g,"") + "@s.whatsapp.net"

await sock.sendMessage(jid,{text:message})

res.json({
status:true,
message:"terkirim"
})

}catch(e){

console.log(e)

res.json({
status:false,
error:e.message
})

}

})


/* =============================
START SERVER
============================= */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("API running on port",PORT)
})


startWA()
