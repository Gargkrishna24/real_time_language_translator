import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch'; 

const app = express();
const server = createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

const PORT = 5000;
const API_KEY = 'AIzaSyBCTgi5JXi69QFqHdhewsn5Jyi1wMGrwbQ';  


io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('translate', async ({ text, targetLanguage, sourceLanguage }) => {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&q=${encodeURIComponent(text)}&target=${targetLanguage}&source=${sourceLanguage}`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();

      if (data.data && data.data.translations && data.data.translations.length > 0) {
        const translatedText = data.data.translations[0].translatedText;
        socket.emit('translation', translatedText);
      } else {
        console.error("Unexpected API response format:", data);
        socket.emit('translation', "Error translating: Check API response.");
      }

    } catch (error) {
      console.error("Translation error:", error);
      socket.emit('translation', "Error translating text.");
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));