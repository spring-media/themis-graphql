const express = require('express');

const app = express();

const objects = [{
  id: 'one',
  state: 'occupied',
  creationDate: '2018-10-16T13:05:16.649Z',
}];

app.get('/someObject/:id', (req, res) => {
  const obj = objects.find(o => (o.id === req.params.id));

  if (obj) {
    res.send(obj);
    res.end();
  }

  res.status(404);
  res.end();
});

module.exports = app;
