async function test() {
  const res = await fetch('https://interviewai-backend-2n3q.onrender.com/api/health');
  console.log(res.status);
  console.log(await res.text());
}
test();
