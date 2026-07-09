async function test() {
  try {
    const res = await fetch('https://interviewai-backend-2n3q.onrender.com/api/mcqs/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobRole: 'Developer',
        skills: ['React'],
        count: 10,
        difficulty: 'easy'
      })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch(e) {
    console.error(e);
  }
}
test();
