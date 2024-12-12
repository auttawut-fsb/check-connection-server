require('dotenv').config();
const express = require('express');
const Pusher = require('pusher');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(cors());
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
  const socketId = req.body.socket_id;
  console.log('Auth request:', req.body);

  if (!socketId) {
    return res.status(400).send('Missing socket_id or channel_name');
  }

  // In a real app, determine the user_id and user_info from session or database
  const user_id = "user_" + Math.floor(Math.random() * 1000); // random user id
  const user_info = {
    name: "John Doe",
    role: "member"
  };

  const authResponse = pusher.authenticateUser(socketId, {
    id: user_id,
    user_info: user_info,
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
