const crypto = require('crypto')

function _do_hash(text,base) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    let ehash = hash.digest('base64url');
    return(ehash)
}

class CWID {

    constructor() {
    }

    _hash_of_sha(text,base) {
        if ( !(base) ) base = 'base64url'
        return _do_hash(text,base)
    }

}



module.exports = CWID
module.exports.do_hash = (text) =>  { return _do_hash(text,'base64url') }