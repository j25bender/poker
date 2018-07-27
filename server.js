const express = require('express');
const app = new express();

app.set('port', process.env.NODE_ENV);
app.locals.title = 'Upload Poker File';
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});