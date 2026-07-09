const express = require('express');
const mongoose = require('mongoose');

const MCQSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  jobRole: { type: String, required: true },
});
const MCQ = mongoose.model('MCQTest', MCQSchema);

const app = express();
app.use(express.json());

app.post('/test', async (req, res, next) => {
  req.auth = { userId: undefined }; // Simulate missing userId
  try {
    const mcqSet = new MCQ({
      userId: req.auth.userId,
      jobRole: "Developer"
    });
    await mcqSet.validate();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ error: message });
  }
  res.status(500).json({ error: err.message });
});

app.listen(3003, async () => {
  const res = await fetch('http://localhost:3003/test', { method: 'POST' });
  console.log(await res.json());
  process.exit(0);
});
