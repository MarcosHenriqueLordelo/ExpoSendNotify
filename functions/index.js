const functions = require("firebase-functions");

const { Expo } = require("expo-server-sdk");

const app = require("express")();

const cors = require("cors");
app.use(cors());

const expo = new Expo();

const sendNotifications = ({ body }, res) => {
  const { tokens, message, title, msgType } = body;

  const notifications = tokens.map(token => ({
    to: token,
    sound: "default",
    title: title,
    body: message,
    data: { type: msgType }
  }));

  const chunks = expo.chunkPushNotifications(notifications);
  const tickets = [];

  chunks.map(chunk => {
    expo
      .sendPushNotificationsAsync(chunk)
      .then(ticketChunk => {
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        return res.status(200).json({ status: "ok" });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({ status: "error" });
      });
  });

};

app.post("/sendNotifys", sendNotifications);

exports.api = functions.https.onRequest(app);