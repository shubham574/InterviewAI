const express = require('express');
const { clerkMiddleware, getAuth } = require('@clerk/express');

process.env.CLERK_PUBLISHABLE_KEY = "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k";
process.env.CLERK_SECRET_KEY = "sk_test_123456789";

const app = express();
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  try {
    const auth = getAuth(req);
    // Let's try assigning it
    req.auth = auth;
    res.json({ auth, reqAuth: req.auth, reqAuthUserId: req.auth.userId });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(3004, async () => {
  try {
    const res = await fetch('http://localhost:3004/');
    console.log(await res.json());
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
