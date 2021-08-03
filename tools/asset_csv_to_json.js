const fs = require('fs')
const CSVtoJSON = require('./csv-to-json')

let ass1 = fs.readFileSync('./assets/multibase.csv').toString()
let ass2 = fs.readFileSync('./assets/formats.csv').toString()


let conv = new CSVtoJSON()
conv.injest(ass1)
conv.add_field("supported",false)

//console.dir(conv.table)

let conv2 = new CSVtoJSON()
conv2.injest(ass2)
conv2.add_field("supported",false)
//console.dir(conv2.table)


fs.writeFileSync('./assets/multibase.json',JSON.stringify(conv.table,null,2))
fs.writeFileSync('./assets/formats.json',JSON.stringify(conv2.table,null,2))
