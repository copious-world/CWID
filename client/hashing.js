//

var g_crypto = window.crypto ? window.crypto.subtle : null
if ( g_crypto === null  ) {
  alert("No cryptography support in this browser. To claim ownership of assets, please use another browser.")
}

const HASH_SEP = '!'
import * as base64 from "../modules/base64.js";
import * as base_string from "../modules/base_string.js";

let formats = false;
let multibase = false;

async function fetch_tables() {

    formats = await fetch('../assets/formats.json')
    .then(response => response.json());

    multibase = await fetch('../assets/multibase.json')
        .then(response => response.json());

    return true
}

setTimeout(fetch_tables,10)

async function do_hash_buffer(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await g_crypto.digest('SHA-256', data);
    return hash
}

export async function do_hash(text) {
    let buffer = await do_hash_buffer(text)
    const hashArray = Array.from(new Uint8Array(buffer));
    return base64.bytesToBase64(hashArray)
}

export function from_hash(base64text) {
    let bytes = base64.base64ToBytes(base64text)
    return bytes
}


export function to_base64(text) {
    return base64.base64encode(text)
}

export function from_base64(base64text) {
    let bytesAsText = base64.base64decode(base64text)
    return bytesAsText
}

export function initializer() {
    window.do_hash = do_hash
}


// https://docs.ipfs.io/concepts/content-addressing/
// -- https://github.com/multiformats/multicodec/blob/master/table.csv
// MULTI BASE FOR IPFS Support 
// u = no padding
// U = with padding
/*

function do_hash (text) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    let ehash = hash.digest('base64');
    ehash = ehash.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    return(ehash)
}


sha2-256	multihash	0x12	permanent	
sha2-512	multihash	0x13	permanent	
sha3-512	multihash	0x14	permanent	
sha3-384	multihash	0x15	permanent	
sha3-256	multihash	0x16	permanent	
sha3-224	multihash	0x17	permanent	

// does not start with Qm, so it is v1.

let cidV1 = 'u' +  encode( 0x55 | 0x12 |  256  encoded 256 bytes...) 


base64url - cidv1 - raw - (sha2-256 : 256 : 6E6FF7950A36187A801613426E858DCE686CD7D7E3C0FC42EE0330072D245C95)

multibase - version - multicodec - multihash (name : size : digest in hex)

*/

const _do_hash = do_hash

export class CWID {

    constructor() {
        this.version = '01'
        this.size = 256/8
        this.hash_code = formats ? formats["sha2-256"].code.substr(2) : '12'
        this.base = 'base64url'
        this.base_code = multibase ? multibase['base64url'].code : 'u'
        this.data_type = 'raw'
        this.type_code = formats ? formats[this.data_type].code.substr(2) : '55'
        this._descriptor = false
        this. select_base(this.base)
    }

    correct_base(base) {
        if ( base === 'hex') return 'base16'
        else if ( base === 'oct' ) return 'base8'
        return base
    }

    select_base(base) {
        if ( multibase === false ) {
            setTimeout(async () => {
                let b = await fetch_tables()
                this.select_base(base)
            },0)
        } else {
            base = this.correct_base(base)
            this.base = base
            this.base_code = multibase[base].code
            this._descriptor = false
            this.descriptor()    
        }
    }

    _descriptor_in_base() {
        if ( this.base !== 'base16' ) {
            switch ( this.base ) {
                case 'base64url': {
                    let AoB = base_string.hex_toByteArray(this._descriptor)
                    this._descriptor = base64.bytesToBase64(AoB)
                    break;
                }
                case 'base64' :
                default: {
                    let AoB = base_string.hex_toByteArray(this._descriptor)
                    this._descriptor = base64.bytesToBase64(AoB,true)
                    break;
                }
            }
        }
        return this._descriptor
    }

    async _hash_of_sha(text,base) {
        if ( !(base) ) base = 'base64url'
        if ( base === 'base64url' ) {
            return  await _do_hash(text)
        } else if ( base === 'hex' || base === 'base16' ) {
            let b64 = await do_hash_buffer(text)
            return base_string.hex_fromTypedArray(new Uint8Array(b64))
        } else {
            return  await _do_hash(text)
        }
    }

    descriptor() {
        if ( this._descriptor ) {
            return this._descriptor
        }
        let dstr = this.version.toString(16)
        dstr += this.type_code
        dstr += this.hash_code
        dstr += this.size.toString(16)
        this._descriptor = dstr
        dstr = this._descriptor_in_base()
        return dstr
    }

    async cwid(text) {
        let hh = await this._hash_of_sha(text,this.base)
        let code = this.descriptor()
        let _cwid = this.base_code + code + HASH_SEP + hh
        return _cwid
    }

    async ipfs_cid(text) {
        if ( this.base === 'base16' ) {
            let _cwid = await this.cwid(text)
            _cwid = _cwid.replace(HASH_SEP,'')
            return _cwid
        } else if ( (this.base === 'base64') || (this.base === 'base64url') ) {
            let _cwid = await this.cwid(text)
            let parts = _cwid.split(HASH_SEP)
            let p = parts[0].substr(1)
            parts[0] = base64.base64ToBytes(p)
            p = parts[1]
            parts[1] = base64.base64ToBytes(p)
            var bytes = new Uint8Array([
                ...parts[0],
                ...parts[1]
            ]);
            let cid = base64.bytesToBase64(bytes)
            cid = this.base_code + cid
            return cid
        } else {
            let backup_base = this.base
            this.select_base('base16')
            let _cwid = await this.cwid(text)
            _cwid = _cwid.replace(HASH_SEP,'')
            this.select_base(backup_base)
            return _cwid
        }
    }
}


