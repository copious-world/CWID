//
// MODULE: CRYPTO WRAPS (windowized)

const HASH_SEP = '!'

// >> import
//modularize>> import * as base64 from "../modules/base64.js";
//modularize>> import * as base64 from "../modules/base_string.js";
//<<


//$>>	fetch_tables
let formats = false;
let multibase = false;

async function fetch_tables() {

    formats = await fetch('../assets/formats.json')
    .then(response => response.json());

    multibase = await fetch('../assets/multibase.json')
        .then(response => response.json());

    return true
}

setTimeout(fetch_tables,0)


//$>>	do_hash_buffer
async function do_hash_buffer(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await g_crypto.digest('SHA-256', data);
    return hash
}

//$>>	do_hash
async function do_hash(text) {
    let buffer = await do_hash_buffer(text)
    const hashArray = Array.from(new Uint8Array(buffer));
    return base64.bytesToBase64(hashArray)
}

//$>>	from_hash
function from_hash(base64text) {
    let bytes = base64.base64ToBytes(base64text)
    return bytes
}

//$>>	to_base64
function to_base64(text) {
    return base64.base64encode(text)
}

//$>>	from_base64
function from_base64(base64text) {
    let bytesAsText = base64.base64decode(base64text)
    return bytesAsText
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


//$>>	CWID

const _do_hash = do_hash

class CWID {

    constructor() {
        this.version = '01'
        this.size = 256/8
        this.hash_code = formats ? formats["sha2-256"].code.substr(2) : '12'
        this.base = 'base64url'
        this.base_code = multibase ? multibase['base64url'].code : 'u'
        this.data_type = 'raw'
        this.type_code = formats ? formats[this.data_type].code.substr(2) : '55'
        this._descriptor = false
        this.tables_promised = false
        this.select_base(this.base)
    }

    correct_base(base) {
        if ( base === 'hex') return 'base16'
        else if ( base === 'oct' ) return 'base8'
        return base
    }

    async select_base(base) {
        if ( this.tables_promised !== false ) {
            await this.tables_promised
            this.tables_promised = false
        }
        if ( multibase === false ) {
            this.tables_promised = new Promise((resolve,reject) => {
                setTimeout(async () => {
                    let b = await fetch_tables()
                    resolve(b)
                },0)    
            })
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
                    let descr = base64.bytesToBase64(AoB)
                    this._descriptor = descr.replace(/\=+/g,'')
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
            let hh = await _do_hash(text)
            return hh.replace(/\=+/g,'')
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

    hash_from_cwid(cwid) {
        let parts = cwid.split(HASH_SEP)
        return(parts[1])
    }

    hash_buffer_from_cwid(cwid) {
        let base = cwid[0]
        let hh = this.hash_from_cwid(cwid)
        let ua8 = false
        if ( base === 'u' ) {
            while ( hh.length % 4 ) hh += '='
            ua8 = base64.base64ToBytes(hh)
        } else if ( base === 'f' ) {
            ua8 = base_string.hex_toByteArray(hh)
        }
        return ua8
    }


    _hex_parts_to_CWID(prefix,rest) {
        let preBuf = base_string.hex_toByteArray(prefix)
        let tailBuf = base_string.hex_toByteArray(rest)
        prefix = base64.bytesToBase64(preBuf)
        prefix = prefix.replace(/\=+/g,'')
        rest = base64.bytesToBase64(tailBuf)
        rest = rest.replace(/\=+/g,'')
        let cwid = 'u' + prefix + HASH_SEP + rest
        return cwid
    }

    _base64_parts_to_hex_CWID(prefix,rest) {
        while ( prefix.length % 4 ) prefix += '='
        while ( rest.length % 4 ) rest += '='
        let preBuf = base64.base64ToBytes(prefix)
        let tailBuf = base64.base64ToBytes(rest)
        prefix = base_string.hex_fromByteArray(preBuf)
        rest = base_string.hex_fromByteArray(tailBuf)
        let cwid = 'f' + prefix + HASH_SEP + rest
        return cwid
    }


    change_base(cwid,to) {
        let from = cwid[0]
        let code = cwid.substr(1)
        if ( from === to ) {
            return cwid
        }
        switch(from) {
            case 'f' : {
                if ( to === 'u' ) to = 'base64url'
                if ( (to !== 'base64') && (to !== 'base64url') ) {
                    console.log("only support from hex-to-base64<type>")
                    return false
                }
                let [prefix,rest] = code.split(HASH_SEP)
                return this._hex_parts_to_CWID(prefix,rest)
            }
            case 'u': {
                if ( from === 'u' ) from = 'base64url'
                if ( to === 'f' ) to = 'hex'
                if ( (to !== 'base16') && (to !== 'hex') ) {
                    console.log("only support from hex-to-base64<type>")
                    return false
                }
                let [prefix,rest] = code.split(HASH_SEP)
                return this._base64_parts_to_hex_CWID(prefix,rest)
            }
        }
        return false
    }

    async ipfs_cid(text) {
        if ( this.base === 'base16' ) {
            let _cwid = await this.cwid(text)
            _cwid = _cwid.replace(HASH_SEP,'')
            return _cwid
        } else if ( (this.base === 'base64') || (this.base === 'base64url') ) {
            let _cwid = await this.cwid(text)
            this.select_base('base64url')
            return this.cwid_to_cid(_cwid)
        } else {
            let backup_base = this.base
            this.select_base('base16')
            let _cwid = await this.cwid(text)
            _cwid = _cwid.replace(HASH_SEP,'')
            this.select_base(backup_base)
            return _cwid
        }
    }

    ipfs_cid_to_cwid(cid) {
        let code = cid[0]
        let bytes = cid.substr(1)
        let cwid = ''
        switch (code) {
            case 'f' : {
                let prefix = bytes.substr(0,8)
                let rest  = bytes.substr(8)
                cwid = 'f' + prefix + '!' + rest
                break
            }
            case 'u' : {
                let buf = base64.base64ToBytes(bytes)
                let hexstr = base_string.hex_fromByteArray(buf)
                let prefix = hexstr.substr(0,8)
                let rest  = hexstr.substr(8)
                cwid = this._hex_parts_to_CWID(prefix,rest)
                break
            }
            default : {
                return false
            }
        }
        return cwid
    }

    cwid_to_cid(cwid) {
        let parts = cwid.split(HASH_SEP)
        let p = parts[0].substr(1)
        while ( p.length % 4 ) p += '='
        parts[0] = base64.base64ToBytes(p)
        p = parts[1]
        while ( p.length % 4 ) p += '='
        parts[1] = base64.base64ToBytes(p)
        var bytes = new Uint8Array([
            ...parts[0],
            ...parts[1]
        ]);
        let cid = base64.bytesToBase64(bytes)
        cid = this.base_code + cid
        return cid
    }

}



//$$EXPORTABLE::
/*
fetch_tables
do_hash_buffer
do_hash
to_base64
from_base64
CWID
*/
