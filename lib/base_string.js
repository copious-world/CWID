//>--
function hex_fromArrayOfBytes(arrayOfBytes) {
    const hexstr = arrayOfBytes.map(b => b.toString(16).padStart(2, '0')).join('');
    return(hexstr)
}
//--<

module.exports.hex_fromArrayOfBytes = hex_fromArrayOfBytes


//>--
function hex_fromTypedArray(byteArray){
    let arrayOfBytes = Array.from(byteArray)
    return(hex_fromArrayOfBytes(arrayOfBytes))
}
//--<

module.exports.hex_fromTypedArray = hex_fromTypedArray


//>--
function b64_fromTypedArray(byteArray){
    let bufferOfBytes = Buffer.from(byteArray)
    let base64urlstr = bufferOfBytes.toString('base64url')
    return(base64urlstr)
}
//--<

module.exports.b64_fromTypedArray = b64_fromTypedArray

//>--
function hex_fromByteArray(byteArray){
    return hex_fromTypedArray(ArrayOfBytes_toByteArray(byteArray))
}
//--<

module.exports.hex_fromByteArray = hex_fromByteArray

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


//>--
function ArrayOfBytes_toByteArray(arrayOfBytes) {
    let byteArray = new Uint8Array(arrayOfBytes)
    return(byteArray)
}
//--<

module.exports.ArrayOfBytes_toByteArray = ArrayOfBytes_toByteArray

//>--
function hex_toByteArray(hexstr) {
    let aob = hex_toArrayOfBytes(hexstr)
    return ArrayOfBytes_toByteArray(aob)
}
//--<

module.exports.hex_toByteArray = hex_toByteArray

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


function string_from_buffer(bytes) {
	let s = ""
	let n = bytes.length
	for ( let i = 0; i < n; i++ ) {
		let c_code = bytes[i]
		s += String.fromCharCode(c_code)
	}
	return s
}

module.exports.string_from_buffer = string_from_buffer


function buffer_from_cvs_array(number_els) {
	let els = number_els.split(',').map(el => parseInt(el))
	let buf = new Uint8Array(els)
	return buf
}

module.exports.buffer_from_cvs_array = buffer_from_cvs_array


function buffer_from_b64_csv(b64_number_els) {
	let numbers = atob(b64_number_els)
	return buffer_from_cvs_array(numbers)
}

module.exports.buffer_from_b64_csv = buffer_from_b64_csv
