const crypto = require('crypto');
const fsPromises = require('fs/promises')

let g_crypto = crypto.webcrypto.subtle

const HASH_SEP = '!'
const base_string = require("./base_string.js");

let formats = false;
let multibase = false;


async function do_hash_buffer(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await g_crypto.digest('SHA-256', data);
    return hash
}

async function fetch_tables() {

    let root = process.cwd()
    formats = await fsPromises.readFile(`${root}/assets/formats.json`)
    formats = JSON.parse(formats.toString())

    multibase = await fsPromises.readFile(`${root}/assets/multibase.json`)
    multibase = JSON.parse(multibase.toString())

    return true
}

function _do_hash(text,base) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    let ehash = hash.digest(base);
    return(ehash)
}

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
                    let AoB = base_string.hex_toByteArray(this._descriptor)  // a uint8
                    this._descriptor = Buffer.from(AoB).toString('base64url');
                    break;
                }
                case 'base64' :
                default: {
                    let AoB = base_string.hex_toByteArray(this._descriptor)
                    this._descriptor = Buffer.from(AoB).toString('base64url');
                    break;
                }
            }
        }
        return this._descriptor
    }

    async _hash_of_sha(text,base) {
        if ( !(base) ) base = 'base64url'
        if ( base === 'base64url' ) {
            return  await _do_hash(text,base)
        } else if ( base === 'hex' || base === 'base16' ) {
            let b64 = await do_hash_buffer(text)
            return base_string.hex_fromTypedArray(new Uint8Array(b64))
        } else {
            console.log(`_hash_of_sha: ${base}`)
            return  await _do_hash(text,base)
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
                let preBuf = Buffer.from(prefix,'hex')
                let tailBuf = Buffer.from(rest,'hex')
                prefix = preBuf.toString(to)
                rest = tailBuf.toString(to)
                let cwid = 'u' + prefix + HASH_SEP + rest
                return cwid
            }
            case 'u': {
                if ( from === 'u' ) from = 'base64url'
                if ( to === 'f' ) to = 'hex'
                if ( (to !== 'base16') && (to !== 'hex') ) {
                    console.log("only support from hex-to-base64<type>")
                    return false
                }
                let [prefix,rest] = code.split(HASH_SEP)
                let preBuf = Buffer.from(prefix,from)
                let tailBuf = Buffer.from(rest,from)
                prefix = preBuf.toString(to)
                rest = tailBuf.toString(to)
                let cwid = 'f' + prefix + HASH_SEP + rest
                return cwid
            }
        }
        return false
    }

    hash_from_cwid(cwid) {
        let parts = cwid.split[HASH_SEP]
        return(parts[1])
    }

    hash_buffer_from_cwid(cwid) {
        let type = cwid[0]
        let base = type === 'f' ? 'hex' : 'base64url'
        let hh = this.hash_from_cwid(cwid)
        let buf = Buffer.from(hh,base)
        let ua8 = new Uint8Array(buf.buffer,0,buf.length)
        return ua8
    }

    async ipfs_cid(text) {
        if ( this.base === 'base16' ) {
            let _cwid = await this.cwid(text)
            _cwid = _cwid.replace(HASH_SEP,'')
            return _cwid
        } else if ( (this.base === 'base64') || (this.base === 'base64url') ) {
            let _cwid = await this.cwid(text)
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
                let buf = Buffer.from(bytes,'base64url')
                let hexstr = buf.toString('hex')
                let prefix = hexstr.substr(0,8)
                let rest  = hexstr.substr(8)
                let preBuf = Buffer.from(prefix,'hex')
                let tailBuf = Buffer.from(rest,'hex')
                prefix = preBuf.toString('base64url')
                rest = tailBuf.toString('base64url')
                cwid = 'u' + prefix + HASH_SEP + rest
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
        parts[0] = Buffer.from(p,'base64url')
        p = parts[1]
        parts[1] = Buffer.from(p,'base64url')
        var bytes = new Uint8Array([
            ...parts[0],
            ...parts[1]
        ]);
        let cidbuf = Buffer.from(bytes)
        let cid = cidbuf.toString('base64url')
        cid = this.base_code + cid
        return cid
    }

}



module.exports = CWID
module.exports.do_hash = (text) =>  { return _do_hash(text,'base64url') }