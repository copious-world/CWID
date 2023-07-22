module.exports = {
    "raw": {
        "name": "raw",
        "tag": "ipld",
        "code": "0x55",
        "status": "permanent",
        "description": "raw binary",
        "supported": true
    },
    "sha2-256": {
        "name": "sha2-256",
        "tag": "multihash",
        "code": "0x12",
        "status": "permanent",
        "description": "",
        "supported": true
    },
    "blake3": {
        "name": "blake3",
        "tag": "multihash",
        "code": "0x1e",
        "status": "draft",
        "description": "BLAKE3 has a default 32 byte output length. The maximum length is (2^64)-1 bytes.",
        "supported": false
      }
}
