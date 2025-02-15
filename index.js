const Keycloak = require('keycloak-connect')
const hogan = require('hogan-express')
const express = require('express')
const session = require('express-session')

const app = express()

const server = app.listen(3000, function () {
  const host = server.address().address
  const port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})

app.use('/css', express.static(require('path').join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(require('path').join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(require('path').join(__dirname, 'node_modules/jquery/dist')))
app.use('/img', express.static(require('path').join(__dirname, 'img')))

app.set('view engine', 'html')
app.set('views', require('path').join(__dirname, '/view'))
app.engine('html', hogan)

const memoryStore = new session.MemoryStore()

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}))

const keycloak = new Keycloak({
  store: memoryStore
})

app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/',
  protected: '/protected/resource'
}))

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/about', function (req, res) {
  res.render('about')
})

app.get('/login', keycloak.protect(), function (req, res) {
  res.render('index', {
    result: JSON.stringify(JSON.parse(req.session['keycloak-token']), null, 4),
    event: '1. Authentication\n2. Login'
  })
})

app.get('/protected/resource', keycloak.enforcer(['resource:view', 'resource:write'], {
  resource_server_id: 'nodejs-apiserver'
}), function (req, res) {
  res.render('index', {
    result: JSON.stringify(JSON.parse(req.session['keycloak-token']), null, 4),
    event: '1. Access granted to Default Resource\n'
  })
})

