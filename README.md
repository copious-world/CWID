# CWID

**C**opious **W**orld content **Id**entififier

You might pronouns it as "quid" or you might say, "swid" like squid. 

### What is a CWID

A **CWID** is an *<u>identifier format</u>* for use as a decentralized identification. Hence, it is part of a [**DID**](https://www.w3.org/TR/did-core/) specified by the **W3C**, found here: https://www.w3.org/TR/did-core/.
The **CWID** will conform to the ***cwid*** *method*, where *method* is defined in the [**DID**](https://www.w3.org/TR/did-core/) spec.

The in the [**DID**](https://www.w3.org/TR/did-core/) core specfication, the DID format is given as follows:

```
did                = "did:" method-name ":" method-specific-id
method-name        = 1*method-char
method-char        = %x61-7A / DIGIT
method-specific-id = *( *idchar ":" ) 1*idchar
idchar             = ALPHA / DIGIT / "." / "-" / "_" / pct-encoded
pct-encoded        = "%" HEXDIG HEXDIG
```

By the DID specification, the CWID format has it as the following:

* method-name  = 'cwid'
* method-specific-id = HEX-CWID

This module produces a CWID which may be rendered in base64 or base16, which is HEX. In most applications using a CWID, the base64 format will be the most useful. But, in keeping with the [**DID**](https://www.w3.org/TR/did-core/) spec, the HEX will be provided.

The module provides a class that is a small engine that produces a **CWID** and can also produce the **DID** containing the **CWID**. So, with this module you will be able to call a method producing something like the following:

```
let my_cwid_did = cwid_engine.get_DID(my_cwid)
console.log(my_cwid_did)
```

This will print something like:

```
did:cwid:9fef8e97d987f97aa987d8e79
```

The third position will be a hex format string which will be a specific hash of information to be used in generating the **CWID**. The string will include a reference to the cryptographic hash that is used.

## CWID Format

A ***CWID*** is a hash of a sequece of bits. 


The CWID format in HEX is as follows:

```
cwid 			= base-code descriptor "!" hex-string
base-code 		= "f"
descriptor		= hex-string
hex-string 		= *HEXDIG 1* HEXDIG
```


The **descriptor** is a hex representation of the bytes of a string made of the following sequence:

```
pre-base-descriptor = version type-code hash-code size 
```

* **version** = `01` for this format version.
* **type-code** - `55` which is the raw data type
* **hash-code** - depends on the constructor parameter defaults to `12` for the sha255 hash.
* **size** - the size in HEX of a hash block in bytes hence 256/8 = 64

The representation of the CWID in HEX is amenable to the DID specification. The most common form will be base64. So, the following will can redefine the CWID format for base64url.


The CWID format in base64url is as follows:

```
cwid 			= base-code descriptor "!" base64-string
base-code 		= "u"
descriptor		= base64-string
base64-string 	= *64DIG 1* 64DIG
```

The *pre-base-descriptor* string will be constructed using the hex values. However, it will be a base64 string of the byte array encoded from the *pre-base-descriptor* string.

If you use the UCWID factory, you will see that the prefix before the "!" is always the same for the base. 

### usage

Since the prefix defining the hash content of the string is always the same and the separator **'!'** is identifiable and not within the character set of the two bases in use, it will be easy to split the string into decoding information and data information.

A method is provided to extract the hash string from the ***CWID***. But, in javascript it can be easily done by spliting the string. E.g.

```
let cwid_maker = new CWID()
await cwid_maker.init()
let cwid = await cwid_maker.cwid("this is some text")
let hh_sha255 = (cwid.split('!'))[1]
// This will be in the base chosen for the CWID (either hex or base64url).
```

In order to retrieve decoding information, an application using this format can simply key the prefix to the methods to use.

```

let prefix = (cwid.split('!'))[0]

let decoder = match_decoder_to_prefix(prefix)  // an application method
let match_bits = decoder(hh_sha255)		// a part of the app

```


### Bases Supported

Currently only **hex** and **base64url** are supported. And, **base64** is possible. The default is **base64url**.

**Want to add a base?** If anyone wants to contribute to the base collection, say something in the issues. 

**Plans:** Currenty only Javascript is in use, but copious-world also has C++ implementations of base string representations. If these prove to improve preformance, they may be employed as node.js modules or as WASM compiled via emscripten.

### Testing

**Web version:** 
```
npm test
```

**Node version:**
```
node ./test/index.js
```

## Methods

* constructor
> has no parameters. new CWID returns a CWID factory. Use it to make many CWIDs

* select\_base(base)
> base can be one of *base64*,*base64url* or one of *hex*,*base16*

* cwid(text)
> returns a CWID in the selected base. The default is *base64url*

* change\_base(cwid,to)
> The current base will be read off of the CWID. And, it will be converted to the **to** base. (hex in [hex,base16,f]) (base64url in [base64url, u]) (base64 in [base64,m])

* hash\_from\_cwid(cwid)
> Just splits the string and returns the second half 

* hash\_buffer\_from\_cwid(cwid)
> converts the second half of the string to uint8Array 

* async ipfs\_cid(text)
> Retuns an ipfs CID of the text in hex or base64url. 

* ipfs\_cid\_to\_cwid(cid)
> Retuns an ipfs CID of the text in hex or base64url.

* cwid\_to\_cid(cwid)
> Converts from a CWID to an IPFS CID in the selected base.


