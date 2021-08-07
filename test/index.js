let CWID = require('../lib/cwid.js')

let do_hash = CWID.do_hash

let p = do_hash("this is a test")
console.log(p)

async function run_test() {
    let cwider = new CWID()
    let text = "MUCH TO DO ABOUT IDENTITY"
    let p = await cwider._hash_of_sha(text,'hex')
    console.log('')
    console.log(text)
    console.log('')
    console.log(p)
    console.log('--------------------------------------')
    let cwid = await cwider.cwid(text)
    console.log(cwid)
    await cwider.select_base('hex')
    cwid = await cwider.cwid(text)
    console.log('')
    console.log(cwid)
    console.log('')
    console.log('back to base64')
    await cwider.select_base('base64')
    cwid = await cwider.cwid(text)
    console.log(cwid)
    console.log('--------------------------------------')
    console.log('ipfs cid base64')
    let cid = await cwider.ipfs_cid(text)
    console.log('FINAL CID')
    console.log(cid)
    console.log('--------------------------------------')
    cwid = cwider.ipfs_cid_to_cwid(cid)
    console.log(cwid)
    cwid = cwider.change_base(cwid,'f')
    console.log(cwid)
    cwid = cwider.change_base(cwid,'u')
    console.log(cwid)
    let hh = cwider.hash_from_cwid(cwid)
    console.log('hash from cwid: ')
    console.log(hh)
    let bb = cwider.hash_buffer_from_cwid(cwid)
    console.log('hash buffer from cwid: ')
    console.log(bb)

    console.log('--------------------------------------')
}


run_test()