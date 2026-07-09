const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();

app.use(express.json());

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return res.status(400).json({ error: errorMessages });
  }
  next();
};

app.post('/test-mcq', [
  body('jobRole', 'Job role is required').notEmpty(),
  body('skills', 'Skills array is required').isArray(),
  body('count', 'Count is required and must be numeric').isNumeric(),
  body('difficulty', 'Difficulty is required').notEmpty(),
], validate, (req, res) => {
  res.json({ success: true, body: req.body });
});

app.post('/test-interview', [
  body('jobRole', 'Job role is required').notEmpty(),
  body('skills', 'Skills array is required').isArray(),
  body('category', 'Category is required').notEmpty(),
], validate, (req, res) => {
  res.json({ success: true, body: req.body });
});

app.listen(3001, async () => {
  console.log('Server running');
  try {
    const res = await fetch('http://localhost:3001/test-mcq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobRole: 'Developer',
        skills: ['React'],
        count: 20,
        difficulty: 'medium'
      })
    });
    console.log('MCQ status:', res.status, await res.json());

    const res2 = await fetch('http://localhost:3001/test-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobRole: 'Developer',
        skills: ['React'],
        category: 'technical',
        count: 10
      })
    });
    console.log('Interview status:', res2.status, await res2.json());
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
