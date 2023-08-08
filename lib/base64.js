


//$>>	bytesToBase64
function bytesToBase64(bytes,url_no) {
    if ( url_no ) {
        return Buffer.from(bytes).toString('base64');
    } else {
        return Buffer.from(bytes).toString('base64url');
    }
}

module.exports.bytesToBase64 = bytesToBase64



//$>>	base64ToBytes
function base64ToBuffer(str,url_no) {
    if ( url_no ) {
        return Buffer.from(str,'base64')
    } else {
        return Buffer.from(str,'base64url')
    }
}

module.exports.base64ToBuffer = base64ToBuffer

