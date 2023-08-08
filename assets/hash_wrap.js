
class Hasher extends WASMInterface {
    w_hash;
    constructor(mod_path) {
        super(mod_path);
    }
    /**
     *
     * @param str - a javascript string to be hashed
     * @returns a Uint8Array containing the hash as bits.
     */
    hash(str) {
        const [pointer, size] = this.write(str); // write does the encoding
        let hashresult = this.w_hash(pointer);
        this.dealloc(pointer, size);
        return this.read_Uint8Array(hashresult, size);
    }
}

window.Hasher = Hasher

