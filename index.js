const express = require("express")
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")
const QRCode = require("qrcode")

const app = express()

const API_TOKEN = "medanusatb17"

let sock
let isReady = false
let qrImage = null

/* ============================= */
/* START WHATSAPP */
/* ============================= */

async function startWA(){

const { state, saveCreds } = await useMultiFileAuthState("session")

sock = makeWASocket({

auth: state,
logger: P({ level:"silent" })

})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async(update)=>{

const { connection, qr } = update


if(qr){

console.log("QR GENERATED")

qrImage = await QRCode.toDataURL(qr)

}


if(connection==="open"){

console.log("WHATSAPP CONNECTED")

isReady = true
qrImage = null

}


if(connection==="close"){

console.log("WA DISCONNECTED")

isReady = false

}

})

}

/* ============================= */
/* STATUS */
/* ============================= */

app.get("/",(req,res)=>{

res.json({
status:isReady ? "connected":"not_connected"
})

})

/* ============================= */
/* QR PAGE */
/* ============================= */

app.get("/qr",(req,res)=>{

if(qrImage){

res.send(`<img src="${qrImage}" width="300">`)

}else{

res.send("QR belum tersedia")

}

})

/* ============================= */
/* SEND MESSAGE */
/* ============================= */

app.get("/send", async(req,res)=>{

try{

if(req.query.token !== API_TOKEN)
return res.json({status:false})

if(!isReady)
return res.json({status:false,message:"WA belum connect"})

const number = req.query.to
const message = req.query.msg

const jid = number.replace(/\D/g,"") + "@s.whatsapp.net"

await sock.sendMessage(jid,{text:message})

res.json({status:true})

}catch(e){

console.log(e)

res.json({
status:false,
error:e.message
})

}

})

/* ============================= */
/* SERVER */
/* ============================= */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

console.log("API running on port",PORT)

})

startWA()
