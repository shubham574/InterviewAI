const express = require('express');
const { clerkMiddleware, getAuth } = require('@clerk/express');

const app = express();
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  const auth = getAuth(req);
  res.json({ auth, reqAuth: req.auth });
});

app.listen(3002, async () => {
  try {
    const res = await fetch('http://localhost:3002/');
    console.log(await res.json());
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
