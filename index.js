const express = require("express")
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")

const app = express()

const API_TOKEN = "medanusatb17"

let sock = null
let isReady = false


/* =============================
   START WHATSAPP
============================= */

async function startWA(){

    const { state, saveCreds } = await useMultiFileAuthState("session")

    sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["RPH Lambaro","Chrome","1.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update)=>{

        const { connection, qr, lastDisconnect } = update

        if(qr){
            console.log("===== SCAN QR =====")
            console.log(qr)
        }

        if(connection==="open"){
            console.log("✅ WhatsApp Connected")
            isReady = true
        }

        if(connection==="close"){

            const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log("WA disconnected")

            isReady = false

            if(shouldReconnect){
                startWA()
            }
        }

    })

}


/* =============================
   API STATUS
============================= */

app.get("/", (req,res)=>{

    res.json({
        status: isReady ? "connected":"not_connected"
    })

})


/* =============================
   SEND MESSAGE
============================= */

app.get("/send", async (req,res)=>{

    try{

        if(req.query.token !== API_TOKEN){
            return res.json({
                status:false,
                message:"token salah"
            })
        }

        if(!isReady){
            return res.json({
                status:false,
                message:"WA belum connect"
            })
        }

        const number = req.query.to
        const message = req.query.msg

        if(!number || !message){
            return res.json({
                status:false,
                message:"parameter kurang"
            })
        }

        const jid = number.replace(/\D/g,"") + "@s.whatsapp.net"

        await sock.sendMessage(jid,{
            text: message
        })

        res.json({
            status:true,
            message:"terkirim"
        })

    }
    catch(e){

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

app.listen(PORT, ()=>{
    console.log("API running on port",PORT)
})


startWA()
