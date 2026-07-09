const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const express = require('express');

const app = express();
app.use(express.json());
app.post('/test', [
  body('count').isNumeric()
], (req, res) => {
  const errors = validationResult(req);
  res.json({ errors: errors.array() });
});

app.listen(3000, async () => {
  const res = await fetch('http://localhost:3000/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count: 20 })
  });
  const data = await res.json();
  console.log("Count as number:", data);

  const res2 = await fetch('http://localhost:3000/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count: "20" })
  });
  const data2 = await res2.json();
  console.log("Count as string:", data2);
  
  process.exit(0);
});
