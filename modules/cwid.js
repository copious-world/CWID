//
// MODULE: CWID (modularized)

// >> import
import * as base64 from "../modules/base64.js";
import * as base_string from "../modules/base_string.js";
import {Hasher} from "../modules/hash_wrap.mjs"
//<<


//$>>	wasm_lib
//
let blake_wasm = false
//$>>	get_blake_hasher
//
async function get_blake_hasher(wasm_path) {
    let wasmod = new Hasher(wasm_path)
    await wasmod.init("mod")
    blake_wasm = wasmod
}

const blake3_hash = (str) => { 
    if ( blake_wasm ) {
        let hash = blake_wasm.hash(str); // => hash a string to a uint8array
        return hash
    }
    return false;
}



// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

let root = '..'

let g_format_path_intializers = [
    `${root}/assets/formats.json`,
    `${root}/assets/multibase.json`
]


//$>>	do_hash
/**
 * 
 * @param {string} text - passes this text to a TextEncoder to get a Uint8Array
 * @param {string} base - 'base16' or 'base64url'
 * @param {string} hash_choice - one of 12 for 'SHA-256' , 1e for 'blask3'
 * @returns - encoded string of hash
 */
async function _do_hash(text,base,hash_choice) {
    const hash_buff = await do_hash_buffer(text,hash_choice)
    switch (base) {
        case 'base16' : {
            return base_string.hex_fromTypedArray(new Uint8Array(hash_buff))
        }
        case 'base64url' :
        default: {
            return base_string.b64_fromTypedArray(new Uint8Array(hash_buff))
        }
    }

}



// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

async function platform_fetch_json(path) {
    let response = await fetch(path)
    let jobj   = await response.json()
    return jobj
}

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

//$>>	fetch_tables
let g_formats = false;
let g_multibase = false;



/**
 * Read in the formats and multibase maps from JSON files stored in a ./assets directory relative to the working directory.
 * @returns {boolean} true if the file operations succeed, false otherwise.
 */
async function fetch_tables() {
    let [formats_path,multibase_path] = g_format_path_intializers
    try {
        g_formats = await platform_fetch_json(formats_path)
        g_multibase = await platform_fetch_json(multibase_path)
    } catch (e) {
        return false
    }
    return true
}




// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
const HASH_SEP = '!'
const DEFAULT_HASH_METHOD = "sha2-256"


/**
 * 
 * @param {string} text 
 * @param {string} hash_choice  - one of 12 for 'SHA-256' , 1e for 'blask3'
 * @returns {Uint8Array} buffer of bytes -- converted to Uint8 Array
 */
async function do_hash_buffer(text,hash_choice) {
    switch (hash_choice) {
        case '12' : {
            const encoder = new TextEncoder();
            const msgUint8 = encoder.encode(text);   // uint 8 array
            const hash_array_buffer = await g_crypto.digest('SHA-256', msgUint8);
            return new Uint8Array(hash_array_buffer)
        }
        case '1e': {  // blake3
            let hash = blake3_hash(text); // => hash a string to a uint8array
            return hash
        }
        default: {
            const encoder = new TextEncoder();
            const msgUint8 = encoder.encode(text);   // uint 8 array
            const hash_array_buffer = await g_crypto.digest('SHA-256', msgUint8);
            return new Uint8Array(hash_array_buffer)
        }
    }
}


//$>>	CWID

/**
 * A CWID factory.  A class for creating method-specific-id of a DID and DID format string from a raw 
 * buffer of data, bytes.
 * 
 * The method specific id includes codes indicating the string base and the hashing algorithm used on data.
 * These codes are chosen can be cound in the IETF working group draft [multibase](https://datatracker.ietf.org/doc/html/draft-multiformats-multibase-03)
 * 
 * Supported hash names are as of the latest release: "blake3", "sha2-256"
 * 
 * The constructor takes two arguments.
 * @param {object} formats - a map of format names to format encoding descriptors, including the format code
 * @param {object} multibase - a map of base names, e.g. "base64url" to base desriptor, include the base code
 * @param {string} ?hash_name - an optional hash name offering a selection from supported hashes
 */
export class CWID {

    constructor(hash_name,formats,multibase) {
        this.init(formats,multibase,hash_name)
    }


    /**
     * The inializer will attempt to load tables for use in managing hash and coding options.
     */
    static async initialize(){
        let ok = await fetch_tables()
        if ( !ok )  reject(new Error("fail to load multibase or formats or both"))
    }
    
    
    /**
     * init peforms the job of the constructor. It is left exposed so that applications can change parameters.
     * Finds the base in the multibase map. Sets the member var _descriptor to descriptor indicating the base selection.
     * If the multibase is not yet loaded, it attempts to load it after returning from constructions. 
     * The delayed loading is provided for use in the constructor.
     * @param {object} formats 
     * @param {object} multibase 
     * @param {string} hash_name 
     */
    init(formats,multibase,hash_name) {
        if ( hash_name == undefined ) {
            hash_name = DEFAULT_HASH_METHOD
        }
        if ( formats === undefined ) {
            formats = g_formats
        }
        if ( multibase === undefined ) {
            multibase = g_multibase
        }
        if ( (multibase === false) || (formats === false) ) {
            throw new Error("CWID module is not initialized")
        } else {
            this.formats = formats
            this.multibase = multibase
            //
            this.version = '01'
            this.size = 256/8
            this.hash_code = this.formats ? this.formats[hash_name].code.substr(2) : '12'  // 0x12 in assets/formats
            this.base = 'base64url'
            this.base_code = this.multibase ? this.multibase['base64url'].code : 'u'        // u for base64
            this.data_type = 'raw'
            this.type_code = this.formats ? this.formats[this.data_type].code.substr(2) : '55'   // indicates raw binary
            this._descriptor = false
            this.select_base(this.base)
        }
    }

    /**
     * Maps basenames 'oct' => 'base8', 'hex' => 'base16'
     * Called by select base.
     * @param {*} base 
     * @returns {string} the name of the base found in the tables's keys.
     */
    correct_base(base) {
        if ( base === 'hex') return 'base16'
        else if ( base === 'oct' ) return 'base8'
        else if ( base === 'base64' ) return 'base64url'
        return base
    }

    /**
     If the multibase map is not iniatialized before other methods
     * are called, `select_base` will not allow them to operate properly. `cwid_to_cid` calls on this method
     * and `ipfs_cid` calls on `cwid_to_cid`.
     * 
     * 
     * @param {string} base name
     */
    select_base(base) {
            base = this.correct_base(base)
            this.base = base
            this.base_code = this.multibase[base].code
            this._descriptor = false
            this.descriptor()
    }

    _descriptor_in_base() {
        if ( this.base !== 'base16' ) {
            switch ( this.base ) {
                case 'base64url': {
                    let AoB = base_string.hex_toByteArray(this._descriptor)  // a uint8
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

    async _hash_of(text,base) {
        if ( !(base) ) base = 'base64url'
        if ( base === 'base64url' ) {
            let hh = await _do_hash(text)
            return hh.replace(/\=+/g,'')
        } else if ( base === 'hex' || base === 'base16' ) {
            return await _do_hash(text,'base16',this.hash_code)
        } else {
            return await _do_hash(text,base,this.hash_code)
        }
    }

    /**
     * 
     * @returns {string} - the descriptor string = `[version type_code hash_code size]` rendered in the selected base
     */
    descriptor() {     // version .. 
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

    /**
     * Given a string or a buffer derived from a string, this will produce the `cwid` format descriptor 
     * which includes the hash of the string resulting from applying the factory's chosen hash fucnction.
     * @param {string | buffer} text
     * @returns 
     */
    async cwid(text) {
        let hh = await this._hash_of(text,this.base)
        let code = this.descriptor()
        let _cwid = this.base_code + code + HASH_SEP + hh
        return _cwid
    }

    /**
     * 
     * @param {string} cwid 
     * @param {string} to - the key indicating the base that is desired.
     * @returns 
     */
    change_base(cwid,to) {
        let from = cwid[0]
        let code = cwid.substring(1)
        //
        if ( to === 'base64url' ) to = 'u'
        else if ( to === 'base64' ) to = 'm'
        else if ( to === 'hex' ) to = 'f'
        else if ( to === 'base16' ) to = 'f'
        //
        if ( from === to ) {
            return cwid
        }
        //
        if ( to === 'u' ) to = 'base64url'
        else if ( to === 'm' ) to = 'base64'
        else if ( to === 'f' ) to = 'hex'
        //
        switch(from) {
            case 'f' : {
                if ( (to !== 'base64') && (to !== 'base64url') ) {
                    console.log("only support from hex-to-base64<type>")
                    return false
                }
                let [prefix,rest] = code.split(HASH_SEP)
                return this._hex_parts_to_CWID(prefix,rest,to)
            }
            case 'u': {
                from = 'base64url'
                if ( to === 'base64' ) {
                    let [prefix,rest] = code.split(HASH_SEP)
                    while ( prefix.length % 4 ) prefix += '='
                    while ( rest.length % 4 ) rest += '='
                    let cwid = 'm' + prefix + HASH_SEP + rest
                    return cwid
                } else {
                    if ( (to !== 'base16') && (to !== 'hex') ) {
                        console.log("only support from base64url-to-hex")
                        return false
                    }
                    let [prefix,rest] = code.split(HASH_SEP)
                    return this._base64_parts_to_hex_CWID(prefix,rest,from)
                }
            }
            case 'm': {
                from = 'base64'
                if ( to === 'base64url' ) {
                    let [prefix,rest] = code.split(HASH_SEP)
                    prefix = prefix.replace(/\=+/g,'')
                    rest = rest.replace(/\=+/g,'')
                    let cwid = 'u' + prefix + HASH_SEP + rest
                    return cwid
                } else {
                    if ( (to !== 'base16') && (to !== 'hex') ) {
                        console.log("only support from base64url-to-hex")
                        return false
                    }
                    let [prefix,rest] = code.split(HASH_SEP)
                    return this._base64_parts_to_hex_CWID(prefix,rest,from)
                }
            }
        }
        return false
    }


    /**
     * Takes a CWID formatted string, splits off the hash string, and returns it.
     * Does not make use of the CWID prefix.
     * @param {string} cwid - the method-specific ID part of the DID
     * @returns 
     */
    hash_from_cwid(cwid) {
        let parts = cwid.split(HASH_SEP)
        return(parts[1])
    }


    /**
     * Returns a binary buffer containing the bits represetned by the CWID string format.
     * @param {string} cwid 
     * @returns{Uint8Array}
     */
    hash_buffer_from_cwid(cwid) {
        let hh = this.hash_from_cwid(cwid)
        let base = cwid[0]
        let ua8 = base_string.code_to_buffer(hh,base)
        return ua8
    }


    _hex_parts_to_CWID(prefix,rest,to) {
        let preBuf = base_string.hex_toByteArray(prefix)
        let tailBuf = base_string.hex_toByteArray(rest)
        prefix = base64.bytesToBase64(preBuf)   // to
        prefix = prefix.replace(/\=+/g,'')
        rest = base64.bytesToBase64(tailBuf)    // to
        rest = rest.replace(/\=+/g,'')
        let bcode = this.multibase[to].code
        let cwid = bcode + prefix + HASH_SEP + rest
        return cwid
    }

    _base64_parts_to_hex_CWID(prefix,rest,from) {
        while ( prefix.length % 4 ) prefix += '='
        while ( rest.length % 4 ) rest += '='
        let preBuf = base64.base64ToBytes(prefix,(from === 'base64'))
        let tailBuf = base64.base64ToBytes(rest,(from === 'base64'))
        prefix = base_string.hex_fromByteArray(preBuf)
        rest = base_string.hex_fromByteArray(tailBuf)
        let cwid = 'f' + prefix + HASH_SEP + rest
        return cwid
    }

    /**
     * Takes in text and returns a CID for IPFS.
     * Internally, this creates a CWID and the converts it to a CID.
     * @param {string | buffer} text - text to hash
     * @returns {string} - this is promise<string> which is the 
     */
    async ipfs_cid(text) {
        if ( this.base === 'base16' ) {
            let _cwid = await this.cwid(text)
            _cwid = _cwid.replace(HASH_SEP,'')
            return _cwid
        } else if ( (this.base === 'base64') || (this.base === 'base64url') ) {
            let backup_base = this.base
            this.select_base('base64url')  // always use 'base64url'
            let _cwid = await this.cwid(text)
            let cid = this.cwid_to_cid(_cwid,this.base)
            this.select_base(backup_base)  // always use 'base64url'
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

    /**
     * 
     * @param {string} cid - a Content ID conforming to IPFS formats
     * @returns 
     */
    ipfs_cid_to_cwid(cid) {
        let code = cid[0]
        let bytes = cid.substring(1)
        let cwid = ''
        switch (code) {
            case 'f' : {
                let prefix = bytes.substring(0,8)
                let rest  = bytes.substring(8)
                cwid = 'f' + prefix + HASH_SEP + rest
                break
            }
            case 'u' : {
                let buf = base64.base64ToBytes(bytes)
                let hexstr = base_string.hex_fromByteArray(buf)
                let prefix = hexstr.substring(0,8)
                let rest  = hexstr.substring(8)
                cwid = this._hex_parts_to_CWID(prefix,rest,'base64url')
                break
            }
            default : {
                return false
            }
        }
        return cwid
    }

    /**
     * Given a CWID, rturns a CID which is used by IPFS
     * @param {string}} cwid 
     * @param {string} base 
     * @returns {string}  Content ID conforming IPFS formats
     */
    cwid_to_cid(cwid,base) {
        if ( base === undefined ) base = 'base64url'
        this.select_base(base)
        let parts = cwid.split(HASH_SEP)
        let p = parts[0].substring(1)
        while ( p.length % 4 ) p += '='
        parts[0] = base64.base64ToBytes(p,(base == 'base64'))
        p = parts[1]
        while ( p.length % 4 ) p += '='
        parts[1] = base64.base64ToBytes(p,(base == 'base64'))
        var bytes = new Uint8Array([
            ...parts[0],
            ...parts[1]
        ]);
        let cid = base64.bytesToBase64(bytes,(base == 'base64'))
        cid = this.base_code + cid
        return cid
    }


    /**
     * Appends the cwid to the DID format prefix
     * If the cwid is in base64 format, it converts it to hex foramt.
     * @param {string} cwid 
     * @returns the DID conformant string.
     */
    cwid_to_did(cwid) {
        cwid = this.change_base(cwid,'hex')        
        let did = `did:cwid:${cwid}`
        return did
    }

}



setTimeout(async () => {
    g_format_path_intializers = [
        `${root}/assets/formats.json`,
        `${root}/assets/multibase.json`
    ]
    await fetch_tables()
    await get_blake_hasher('../assets/blake3_wasm_nopackage.wasm')
},0)




export async function do_hash(text) {
    let buffer = await do_hash_buffer(text)
    const hashArray = Array.from(new Uint8Array(buffer));
    return base64.bytesToBase64(hashArray)
}

//$>>	from_hash
export function from_hash(base64text) {
    let bytes = base64.base64ToBytes(base64text)
    return bytes
}

//$>>	to_base64
export function to_base64(text) {
    return base64.base64encode(text)
}

//$>>	from_base64
export function from_base64(base64text) {
    let bytesAsText = base64.base64decode(base64text)
    return bytesAsText
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
