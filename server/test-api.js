async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/mcqs/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobRole: 'Frontend Developer',
        skills: ['React', 'JavaScript'],
        count: 20,
        difficulty: 'medium'
      })
    });
    const data = await res.json();
    console.log('MCQ Status:', res.status);
    console.log('MCQ Data:', data);
  } catch (err) {
    console.error(err);
  }

  try {
    const res = await fetch('http://localhost:5000/api/interview/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobRole: 'Frontend Developer',
        skills: ['React', 'JavaScript'],
        category: 'technical',
        count: 10
      })
    });
    const data = await res.json();
    console.log('Interview Status:', res.status);
    console.log('Interview Data:', data);
  } catch (err) {
    console.error(err);
  }
}

test();
