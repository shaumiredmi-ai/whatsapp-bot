const express = require("express")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const P = require("pino")
const QRCode = require("qrcode")

const app = express()

const API_TOKEN = "medanusatb17"

let sock
let isReady = false
let qrImage = null


async function startWA(){

const { state, saveCreds } = await useMultiFileAuthState("session")

const { version } = await fetchLatestBaileysVersion()

sock = makeWASocket({
version,
auth: state,
logger: P({ level:"silent" }),
browser:["Ubuntu","Chrome","20"]
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async(update)=>{

const { connection, qr, lastDisconnect } = update


if(qr){

console.log("QR GENERATED")

qrImage = await QRCode.toDataURL(qr)

}


if(connection==="open"){

console.log("WHATSAPP CONNECTED")

isReady = true

}


if(connection==="close"){

isReady = false

console.log("WA DISCONNECTED")

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

if(shouldReconnect){

setTimeout(startWA,5000)

}

}

})

}


/* STATUS */

app.get("/",(req,res)=>{

res.json({
status:isReady ? "connected":"not_connected"
})

})


/* QR PAGE */

app.get("/qr",(req,res)=>{

if(qrImage){

res.send(`<img src="${qrImage}" width="300">`)

}else{

res.send("QR belum tersedia, refresh halaman")

}

})


/* SEND MESSAGE */

app.get("/send", async(req,res)=>{

try{

if(req.query.token !== API_TOKEN)
return res.json({status:false})

if(!isReady)
return res.json({status:false,message:"WA belum connect"})

const jid = req.query.to.replace(/\D/g,"")+"@s.whatsapp.net"

await sock.sendMessage(jid,{text:req.query.msg})

res.json({status:true})

}catch(e){

res.json({status:false,error:e.message})

}

})


app.listen(process.env.PORT||3000,()=>{
console.log("API running")
})


startWA()
