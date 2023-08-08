// data server under ....<app name>
// viewing data server
//
const fs = require('fs')
const polka = require('polka')
const send = require('@polka/send-type');
//
const { json } = require('body-parser');
const cors = require('cors');
const serve = require('serve-static')('public');
const compress = require('compression')();


let g_prune_timeout = null
//
const app = polka()
let app_cors = cors((req, callback) => {
    let corsOptions = { origin: true };             // req.header('Origin')
    callback(null, corsOptions) // callback expects two parameters: error and options
})


app.use(app_cors, compress, json(), serve)


// ---- ---- ---- ---- HTML APPLICATION PATHWAYS  ---- ---- ---- ---- ---- ---- ----

app.get('/',(req, res) => {
    try {
        const stream = fs.createReadStream('./test/test.html')
        send(res,200,stream,{ 'Content-Type': 'text/html' })
    } catch (e) {
        send(res,404,"what")    
    }
})



app.get('js/:file',(req, res) => {
    let file = req.params.file
    try {
        const stream = fs.createReadStream(`./js/${file}`)
        send(res,200,stream,{ 'Content-Type': 'text/javascript' })
    } catch (e) {
        send(res,404,"what")    
    }
})



app.get('/wasm/:file_name',(req, res) => {
    let fname = req.params.file_name 
    try {
        const stream = fs.createReadStream(`./assets/${fname}.wasm`)
        send(res,200,stream,{ 'Content-Type': 'application/wasm' })
    } catch (e) {
        send(res,404,"what")
    }
})


const g_port = '8080'
//
const start = async () => {
    try {
        console.log(`counter admin :: listening on port: ${g_port}`)
        await app.listen(g_port)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- RUN  ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// // // 

start()
//
