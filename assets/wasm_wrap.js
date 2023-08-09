/**
 *  This provides a basic interface to some WASM module,
 *  where the module will make use of a basic allocation and deallocation.
 *  The interface will provide one based callback for the module for the purpose of logging.
 */
class WASMInterface {
    constructor(mod_path) {
        this._mod_path = mod_path;
        this.linearMemory = false;
        this.mod = false;
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }
    /**
     *
     * @param mod_path - a string indicating the server URI path to a resource
     * @param import_object - an object conforming to WASM import decriptor format
     * @returns {Object} - this is a map from keys to ExportValue
     */
    async get_wasm_module(mod_path, import_object) {
        let obj = await WebAssembly.instantiateStreaming(fetch(mod_path), import_object);
        this.linearMemory = obj.instance.exports.memory;
        return obj.instance.exports;
    }
    /**
     *
     * @param module_name - a string indicating the server URI path to a resource
     *
     * Creates an Import Object for use by the module.
     * The import object sets the memory base, the table base, and creates a new WebAssembly.Memory.
     * The "alert" method is provided to the WASM for use. (This may be implemented in any way the application sees fit:
     * override `wasm_alert`).
     *
     * After a WASM stream is instantiated, the exported module object will update the current class
     * with keys representing the exported functions of the WASM source.
     *
     */
    async init(module_name) {
        //
        let importObject = {};
        //
        importObject[module_name] = {
            __memory_base: 0,
            __table_base: 0,
            memory: new WebAssembly.Memory({ initial: 1 }),
            "message_js": (str_offset, size) => { this.wasm_alert(str_offset, size); }
        };
        this.mod = await this.get_wasm_module(this._mod_path, importObject);
        let self = this;
        for (let ky in this.mod) {
            self[ky] = this.mod[ky];
        }
        //
    }
    /**
     *
     * @param {string} str - a string from JS to be written to the WASM memory page.
     * @returns {Array} - a pair:
     *  * *first* = the pointer (offset) into WASM memory where the string will reside (-1 on error)
     *  * *second* = returns the size of the region, which may differ from the size of the string.
     */
    write(str) {
        if (this.linearMemory.buffer) {
            const sz = str.length + 1;
            const pointer = this.alloc(sz); // if null termination will be used
            const view = new Uint8Array(this.linearMemory.buffer, pointer, sz);
            view.set(this.encoder.encode(str));
            return [pointer, sz];
        }
        return [-1, 0];
    }
    /**
     *
     * @param pointer - the memory offset into the WASM page where text data is located
     * @param size  - the size of the section previously returned by alloc.
     * @returns {string} - the JS string derived from encoding the bytes stored at the pointer.
     */
    read(pointer, size) {
        if (this.linearMemory.buffer) {
            let uint8array = this.read_Uint8Array(pointer, size);
            if (uint8array) {
                return this.decoder.decode(uint8array);
            }
        }
        return '';
    }
    ;
    /**
     *
     * @param pointer - the memory offset into the WASM page where text data is located
     * @param size - the size of the section previously returned by alloc.
     * @returns {Uint8Array} - the bytes stored in the section without decoding
     */
    read_Uint8Array(pointer, size) {
        if (this.linearMemory.buffer) {
            const view = new Uint8Array(this.linearMemory.buffer, pointer, size);
            //const length = view.findIndex(byte => byte === 0);
            return new Uint8Array(this.linearMemory.buffer, pointer, size);
        }
    }
    /**
     *
     * @param {number} str_offset - an offset passed by the module indicating where the string is stored
     * @param {number} size - the size of the string.
     * @returns {string} - the string returned from WASM storage.
     */
    wasm_string(str_offset, size) {
        const stringBuffer = new Uint8Array(this.linearMemory.buffer, str_offset, size);
        let str = '';
        let n = stringBuffer.length;
        for (let i = 0; i < n; i++) { // use a loop to convert
            str += String.fromCharCode(stringBuffer[i]);
        }
        return str;
    }
    /**
     * A method provided to the module allowing a string the module generates to be used for alert or logging.
     *
     * calss `wasm_string`
     *
     * @param {number} str_offset - an offset passed by the module indicating where the string is stored
     * @param {number} size - the size of the string.
     */
    wasm_alert(str_offset, size) {
        let str = this.wasm_string(str_offset, size);
        alert(str);
    }

    /**
     * 
     * @returns the string that is the name of the plugin
     */
    plugin_name_str() {
        let plgn_name_ref = this.plugin_name();
        let slen = this.plugin_name_len();
        return this.wasm_string(plgn_name_ref, slen);
    }
}
