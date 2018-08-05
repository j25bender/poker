const express = require('express')
const app = new express()
const bodyParser = require('body-parser')
const fs = require('fs')

app.set('port', process.env.NODE_ENV)
app.locals.title = 'Upload Poker File'
app.set('port', process.env.PORT || 3000)
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/api/v1/winner-results', (req, res) => {
  console.log('req', req.body.bestHand)
  fs.writeFile('output.txt', req.body.bestHand, (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
})