const express = require("express")
const { Client, LocalAuth } = require("whatsapp-web.js")
const QRCode = require("qrcode")

const app = express()

const API_TOKEN = "medanusatb17"

let isReady = false
let qrImage = null

console.log("STARTING BOT...")


/* =============================
INIT CLIENT
============================= */

const client = new Client({

    authStrategy: new LocalAuth({
        dataPath: "./session"
    }),

    webVersionCache: { type: "none" },

    puppeteer:{
        headless:true,
        args:[
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-background-networking",
            "--disable-sync",
            "--disable-default-apps",
            "--no-first-run",
            "--disable-gpu",
            "--single-process",
            "--no-zygote"
        ]
    }

})


/* =============================
QR
============================= */

client.on("qr", async qr => {

    console.log("QR GENERATED")

    qrImage = await QRCode.toDataURL(qr)

})


/* =============================
READY
============================= */

client.on("ready", ()=>{

    console.log("WHATSAPP READY")

    isReady = true
    qrImage = null

})


/* =============================
DISCONNECT
============================= */

client.on("disconnected",(reason)=>{

    console.log("WA DISCONNECTED:",reason)

    isReady = false

    setTimeout(()=>{

        console.log("RESTARTING CLIENT")

        client.initialize()

    },5000)

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
        <h2>SCAN QR</h2>
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

app.get("/send",async(req,res)=>{

    console.log("REQUEST:",req.query)

    try{

        if(req.query.token !== API_TOKEN)
            return res.json({status:false,message:"token salah"})


        if(!isReady)
            return res.json({status:false,message:"WA belum connect"})


        let number = req.query.to
        const message = req.query.msg


        if(!number || !message)
            return res.json({status:false,message:"parameter kurang"})


        number = number.replace(/\D/g,"")

        if(number.startsWith("0"))
            number = "62"+number.slice(1)


        const chatId = number+"@c.us"

        console.log("SEND TO:",chatId)


        const result = await client.sendMessage(chatId,message)

        console.log("SENT OK")


        res.json({
            status:true,
            id:result.id._serialized
        })

    }
    catch(e){

        console.log("ERROR:",e)

        res.json({
            status:false,
            error:e.message
        })

    }

})


/* =============================
HEALTH CHECK
============================= */

setInterval(()=>{

    console.log("HEALTH CHECK - READY:",isReady)

    const mem = process.memoryUsage().heapUsed/1024/1024

    console.log("RAM:",Math.round(mem),"MB")

},60000)


/* =============================
SERVER
============================= */

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

    console.log("API RUNNING PORT",PORT)

})


client.initialize()
