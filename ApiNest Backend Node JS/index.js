require('dotenv').config();
// console.log('CLIENT URL:', process.env.CLIENT_URL);
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT 
const URI = process.env.MONGO_URI

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/portal/auth', require('./routes/auth.routes'));

app.use('/portal/workspaces', require('./routes/workspace.routes'));
app.use('/portal/keys', require('./routes/key.routes'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

mongoose
  .connect(URI)
  .then(() => {
    console.log('Connected');
  })
  .catch((err) => console.log('Connection failed:', err.message));