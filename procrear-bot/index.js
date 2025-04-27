require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const URL = process.env.TARGET_URL;
let alreadyNotified = false;

async function checkProcrear() {
  try {
    const res = await axios.get(URL);
    const $ = cheerio.load(res.data);

    const text = $("body").text().toLowerCase();
    const keywords = ["inscripción abierta", "inscribirme", "nueva convocatoria"];

    const found = keywords.some(keyword => text.includes(keyword));

    if (found && !alreadyNotified) {
      await client.messages.create({
        body: "¡Atención! Se detectó una posible apertura de inscripción en Procrear.",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.MY_PHONE
      });
      alreadyNotified = true;
      console.log("Notificación enviada por WhatsApp.");
    } else {
      console.log("No hay inscripciones abiertas aún.");
    }
  } catch (err) {
    console.error("Error al escanear la página:", err.message);
  }
}

// Ejecutar cada 30 minutos
setInterval(checkProcrear, 1000 * 60 * 30);
checkProcrear();