// MODULE: BASE STRING (node)
// When windowized, these methods defined on the window, and base_string = window 
// povides access similar to the module call


//$>>	hex_fromArrayOfBytes
//>--
function hex_fromArrayOfBytes(arrayOfBytes) {
    const hexstr = arrayOfBytes.map(b => b.toString(16).padStart(2, '0')).join('');
    return(hexstr)
}
//--<

module.exports.hex_fromArrayOfBytes = hex_fromArrayOfBytes

//$>>	hex_fromTypedArray
//                                                  <<depends>> hex_fromArrayOfBytes
//>--
function hex_fromTypedArray(byteArray){
    let arrayOfBytes = Array.from(byteArray)
    return(hex_fromArrayOfBytes(arrayOfBytes))
}
//--<
module.exports.hex_fromTypedArray = hex_fromTypedArray

//$>>	hex_fromByteArray
//                                                  <<depends>> hex_fromTypedArray,ArrayOfBytes_toByteArray
//>--
function hex_fromByteArray(byteArray){
    return hex_fromTypedArray(ArrayOfBytes_toByteArray(byteArray))
}
//--<
module.exports.hex_fromByteArray = hex_fromByteArray


//$>>	hex_fromByteArray
//                                                  <<depends>> hex_fromTypedArray,ArrayOfBytes_toByteArray
//>--
function hex_fromBuffer(buf){
    return buf.toString('hex')
}
//--<
module.exports.hex_fromBuffer = hex_fromBuffer



//$>>	hex_toArrayOfBytes
//>--
function hex_toArrayOfBytes(hexString) {
    let result = [];
    for ( let i = 0; i < hexString.length; i += 2 ) {
      result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
}
//--<

module.exports.hex_toArrayOfBytes = hex_toArrayOfBytes

//$>>	ArrayOfBytes_toByteArray
//>--
function ArrayOfBytes_toByteArray(arrayOfBytes) {
    let byteArray = new Uint8Array(arrayOfBytes)
    return(byteArray)
}
//--<

module.exports.ArrayOfBytes_toByteArray = ArrayOfBytes_toByteArray


//$>>	hex_toByteArray
//                                                  <<depends>> hex_toArrayOfBytes
//>--
function hex_toByteArray(hexstr) {
    let aob = hex_toArrayOfBytes(hexstr)
    return ArrayOfBytes_toByteArray(aob)
}
//--<

module.exports.hex_toByteArray = hex_toByteArray

//$>>	bufferToArrayBufferCycle
//>--
function bufferToArrayBufferCycle(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return ab;
}
//--<

module.exports.bufferToArrayBufferCycle = bufferToArrayBufferCycle

//$>>	string_from_buffer
//>--
function string_from_buffer(bytes) {
	let s = ""
	let n = bytes.length
	for ( let i = 0; i < n; i++ ) {
		let c_code = bytes[i]
		s += String.fromCharCode(c_code)
	}
	return s
}
//--<
module.exports.string_from_buffer = string_from_buffer


//$>>	buffer_from_cvs_array
//>--
function buffer_from_cvs_array(number_els) {
	let els = number_els.split(',').map(el => parseInt(el))
	let buf = new Uint8Array(els)
	return buf
}
//--<
module.exports.buffer_from_cvs_array = buffer_from_cvs_array

//$>>	code_to_buffer
//>--
/**
 * 
 * @param {string} hh - the data to convert
 * @param {string} type - single character code indicating the type of the string
 * @returns Uint8Array of the decoded string
 */
function code_to_buffer(hh,type) {
    let base = type === 'f' ? 'hex' : 'base64url'
    let buf = Buffer.from(hh,base)
    let ua8 = new Uint8Array(buf.buffer,0,buf.length)
    return ua8    
}
//--<
module.exports.code_to_buffer = code_to_buffer



//$>>	buffer_from_b64_csv
//                                                  <<depends>> buffer_from_cvs_array
//>--
/**
 * Converts from base64 to the orginial text, a comma delimited list of numbers,
 * and then turns the list into a Uint8Array
 * @param {string} b64_number_els - b64 representation of comma delimited numbers
 * @returns 
 */
function buffer_from_b64_csv(b64_number_els) {
	let numbers = code_to_buffer('u',b64_number_els)
	return buffer_from_cvs_array(numbers)
}
//--<

module.exports.buffer_from_b64_csv = buffer_from_b64_csv


//>--
function b64_fromTypedArray(byteArray){
    let bufferOfBytes = Buffer.from(byteArray)
    let base64urlstr = bufferOfBytes.toString('base64url')
    return(base64urlstr)
}
//--<

module.exports.b64_fromTypedArray = b64_fromTypedArray

//--<

