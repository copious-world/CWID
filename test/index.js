let CWID = require('../lib/cwid.js')

let do_hash = CWID.do_hash

async function static_hash() {
    let p = await do_hash("this is a test") // this is async due to ref to crypto.subtle being async
    console.log(p)    
}

async function run_test() {
    //
    await static_hash()
    //
    await CWID.initialize()  // initialize the whole module if files or not loaded...
    //
    let cwider = new CWID() // the CWID engine will not load file behind the scene and will fail if the module in general is no initalized
    //
    let text = "MUCH TO DO ABOUT IDENTITY"
    let p = await cwider._hash_of(text,'hex')
    console.log('1')
    console.log(text)
    console.log('2')
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
    cwid = cwider.change_base(cwid,'m')
    console.log(cwid)
    cwid = cwider.change_base(cwid,'u')
    console.log(cwid)
    cwid = cwider.change_base(cwid,'hex')
    console.log(cwid)
    cwid = cwider.change_base(cwid,'m')
    console.log(cwid)
    cwid = cwider.change_base(cwid,'u')
    console.log(cwid)
    console.log('--------------------------------------')
    let did = cwider.cwid_to_did(cwid)
    console.log(did)
    console.log('--------------------------------------')


    let cwider2 = new CWID('blake3')
    let cwid2 = await cwider2.cwid(text)
    console.log("blake3:",cwid2)
    did = cwider2.cwid_to_did(cwid2)
    console.log(did)

}


run_test()