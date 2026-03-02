fetch('http://localhost:3001/api/deploy/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    project_id: '2',
    task_uuid: '2dcaa557',
    labels: ['multi_position']
  })
})
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e.message))
