// Loads the browser interpreter modules into Node.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { console, TextDecoder, BigInt, Date, Math };
vm.createContext(ctx);
for (const f of ['front.js', 'vm.js', 'lib.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/c', f), 'utf8'), ctx, { filename: f });
const CI = {};
vm.runInContext('CI_MODULES', ctx).forEach(m => m(CI));
module.exports = CI;
