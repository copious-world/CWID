let CWID = require('../lib/cwid.js')

let do_hash = CWID.do_hash


let p = do_hash("this is a test")
console.log(p)


let cwid = new CWID()

p = cwid._hash_of_sha("this is a test",'base64')

console.log(p)