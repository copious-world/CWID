// MODULE: BASE STRING (windowized)

//$>>	gen_nonce
function gen_nonce() {
	return btoa(window.crypto.getRandomValues(new Uint8Array(16)))
}


//$>>	hex_fromArrayOfBytes
//>--
function hex_fromArrayOfBytes(arrayOfBytes) {
    const hexstr = arrayOfBytes.map(b => b.toString(16).padStart(2, '0')).join('');
    return(hexstr)
}
//--<

//$>>	hex_fromTypedArray
//                                                  <<depends>> hex_fromArrayOfBytes
//>--
function hex_fromTypedArray(byteArray){
    let arrayOfBytes = Array.from(byteArray)
    return(hex_fromArrayOfBytes(arrayOfBytes))
}
//--<

//$>>	hex_fromByteArray
//                                                  <<depends>> hex_fromTypedArray,ArrayOfBytes_toByteArray
//>--
function hex_fromByteArray(byteArray){
    return hex_fromTypedArray(ArrayOfBytes_toByteArray(byteArray))
}
//--<

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


//$>>	ArrayOfBytes_toByteArray
//>--
function ArrayOfBytes_toByteArray(arrayOfBytes) {
    let byteArray = new Uint8Array(arrayOfBytes)
    return(byteArray)
}
//--<



//$>>	hex_toByteArray
//                                                  <<depends>> hex_toArrayOfBytes
//>--
function hex_toByteArray(hexstr) {
    let aob = hex_toArrayOfBytes(hexstr)
    return ArrayOfBytes_toByteArray(aob)
}
//--<

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


//$>>	buffer_from_cvs_array
//>--
function buffer_from_cvs_array(number_els) {
	let els = number_els.split(',').map(el => parseInt(el))
	let buf = new Uint8Array(els)
	return buf
}
//--<

//$>>	buffer_from_b64_csv
//                                                  <<depends>> buffer_from_cvs_array
//>--
function buffer_from_b64_csv(b64_number_els) {
	let numbers = atob(b64_number_els)
	return buffer_from_cvs_array(numbers)
}
//--<

//$$EXPORTABLE::
/*
gen_nonce
hex_fromArrayOfBytes
hex_fromTypedArray
hex_fromByteArray
hex_toArrayOfBytes
ArrayOfBytes_toByteArray
hex_toByteArray
bufferToArrayBufferCycle
string_from_buffer
buffer_from_cvs_array
buffer_from_b64_csv
*/
