const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();

const TOKEN = "usatb17";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless:true,
        args:["--no-sandbox"]
    }
});

client.on("ready", ()=>{

    console.log("BOT READY");

});


app.get("/send", async (req,res)=>{

    if(req.query.token !== TOKEN){

        return res.send("token salah");

    }

    await client.sendMessage(
        req.query.to+"@c.us",
        req.query.msg
    );

    res.send("ok");

});


app.listen(3000);

client.initialize();
