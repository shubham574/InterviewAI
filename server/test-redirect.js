async function test() {
  const res = await fetch('https://interviewai-backend-2n3q.onrender.com/api/mcqs/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobRole: 'Developer',
      skills: ['React'],
      count: 10,
      difficulty: 'easy'
    }),
    redirect: 'manual'
  });
  console.log('Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  console.log('Body:', await res.text());
}
test();
