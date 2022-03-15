let CWID = require('./lib/cwid.js')

module.exports = CWID







const {browser_code} = require('roll-right')
module.exports.browser_code = () => { return browser_code(__dirname) }
