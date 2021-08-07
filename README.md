# CWID

**C**opious **W**orld content **Id**entififier

You might pronouns it as "quid" or you might say, "swid" like squid. 

### Purpose

A ***CWID*** is something like and IPFS CID, but it has a different format. In particular it separates a prefix string and a string representing the SHA256 of content by a delimiting character. The *exclamation point*, **'!'**, has been chosen as this delimiting character.

A method is provided to extract the hash string from the ***CWID***. But, in javascript it can be easily done by spliting the string. E.g.

```
let cwid_maker = new CWID()
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

