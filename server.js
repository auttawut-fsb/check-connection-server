require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Auth endpoint for presence channel
// Typically you'd validate the user's identity here.
// For now, we assume the user is logged in and has an ID.
app.post('/pusher/auth', (req, res) => {
  const { channel_name, socket_id } = req.body;

  // In a real app, determine the user_id and user_info from session or database
  const user_id = "user_" + Math.floor(Math.random() * 1000); // random user id
  const user_info = {
    name: "John Doe",
    role: "member"
  };

  const authResponse = pusher.authenticate(socket_id, channel_name, {
    user_id: user_id,
    user_info: user_info
  });

  res.send(authResponse);
});

// Handle Pusher webhooks (when members join/leave presence channels)
app.post('/pusher/webhook', (req, res) => {
  const { events } = req.body;

  if (events) {
    events.forEach(async (event) => {
      if (event.name === 'member_removed') {
        const userId = event.user_id;
        console.log(`User ${userId} went offline (left the channel).`);

        // Example: call an external API or update DB
        // Here we just log it, but you can uncomment and set your endpoint:
        // await axios.post('https://example.com/offline-notify', { userId })
        //   .then(response => console.log('Notified offline:', response.data))
        //   .catch(err => console.error('Error notifying offline:', err.message));
      }

      if (event.name === 'member_added') {
        const userId = event.user_id;
        console.log(`User ${userId} came online (joined the channel).`);
      }
    });
  }

  // Acknowledge the webhook
  res.status(200).send('ok');
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
