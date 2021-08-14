# CWID

**C**opious **W**orld content **Id**entififier

You might pronouns it as "quid" or you might say, "swid" like squid. 

### Purpose

A ***CWID*** is something like an IPFS CID, but it has a different format. In particular it separates a prefix string and a string representing the SHA256 of content by a delimiting character. The *exclamation point*, **'!'**, has been chosen as this delimiting character.

A method is provided to extract the hash string from the ***CWID***. But, in javascript it can be easily done by spliting the string. E.g.

```
let cwid_maker = new CWID()
await cwid_maker.init()
let cwid = await cwid_maker.cwid("this is some text")
let hh_sha255 = (cwid.split('!'))[1]
// This will be in the base chosen for the CWID (either hex or base64url).
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


