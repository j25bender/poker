const express = require('express');
const app = new express();
const bodyParser = require('body-parser');

app.set('port', process.env.NODE_ENV);
app.locals.title = 'Upload Poker File';
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/api/v1/pokerData', (req, res) => {
  // const { title } = request.body;

  if (!req.body.file.length) {
    return response
      .status(422)
      .send({ error: `Error no length` });
  }

  database('projects').insert({ title }, 'id')
    .then(project => {
      response.status(201).json({ id: project[0], title })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});