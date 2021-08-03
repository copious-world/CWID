



class SimpleParse {
    constructor() {
        this.table = {}
    }

    injest(csv) {
        let lines = csv.split('\n')
        let header = lines.shift()
        header = header.split(',')
        header = header.map(el => el.trim())
        for ( let line of lines ) {
            let items = line.split(',')
            let key = items[0].trim()
            this.table[key] = this.to_obj(items,header)
        }
    }

    to_obj(items,header) {
        let obj = {}
        for ( let ky of header ) {
            obj[ky] = (items.shift()).trim()
            if ( items.length === 0 ) break;
        }
        return obj
    }


    add_field(field,value) {
        for ( let ky in this.table ) {
            this.table[ky][field] = value
        }
    }

}


module.exports = SimpleParse