const express = require("express")
const fs = require("fs")
const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const P = require("pino")
const QRCode = require("qrcode")

const app = express()

const API_TOKEN = "medanusatb17"

let sock = null
let isReady = false
let qrImage = null


/* =============================
CREATE SESSION FOLDER
============================= */

if (!fs.existsSync("./session")) {
    fs.mkdirSync("./session")
}


/* =============================
START WHATSAPP
============================= */

async function startWA(){

    console.log("STARTING WHATSAPP...")

    const { state, saveCreds } = await useMultiFileAuthState("./session")

    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({

        version,
        auth: state,
        logger: P({ level: "silent" }),
        browser: ["Railway","Chrome","1.0"]

    })

    sock.ev.on("creds.update", saveCreds)


    sock.ev.on("connection.update", async (update)=>{

        const { connection, lastDisconnect, qr } = update


        /* =============================
        QR RECEIVED
        ============================= */

        if(qr){

            console.log("QR RECEIVED")

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

                console.log("RECONNECTING...")

                startWA()

            }

        }

    })

}


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
        <p>Refresh jika QR berubah</p>
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


            /* =============================
            DETECT GROUP / NOMOR
            ============================= */
            
            let jid
            
            if(number.includes("@g.us")){
            
                // kirim ke group
                jid = number
            
            }else{
            
                // kirim ke nomor
                number = number.replace(/\D/g,"")
            
                if(number.startsWith("0"))
                    number = "62"+number.slice(1)
            
                jid = number + "@s.whatsapp.net"
            
            }


        await sock.sendMessage(jid,{
            text: message
        })


        res.json({
            status:true,
            to:jid
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
SEND IMAGE
============================= */

app.get("/send-image", async (req,res)=>{

    try{

        if(req.query.token !== API_TOKEN)
            return res.json({status:false})

        if(!isReady)
            return res.json({status:false,message:"WA belum connect"})

        let number = req.query.to
        const caption = req.query.caption || ""
        const image = req.query.image

        if(!number || !image)
            return res.json({status:false})


        /* DETECT GROUP / NOMOR */

        let jid

        if(number.includes("@g.us")){

            jid = number

        }else{

            number = number.replace(/\D/g,"")

            if(number.startsWith("0"))
                number = "62"+number.slice(1)

            jid = number + "@s.whatsapp.net"

        }


        console.log("SEND IMAGE TO:", jid)

        await sock.sendMessage(jid,{
            image: { url: image },
            caption: caption
        })


        res.json({
            status:true,
            to:jid
        })

    }
    catch(e){

        console.log("SEND IMAGE ERROR:",e)

        res.json({
            status:false
        })

    }

})

/* =============================
RAM MONITOR
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


/* =============================
START
============================= */

startWA()
