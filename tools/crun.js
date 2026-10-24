// Usage: node tools/crun.js prog.c [stdin-file] [--trace]
const CI = require('./ci-node.js'), fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const inp = process.argv[3] && !process.argv[3].startsWith('--') ? fs.readFileSync(process.argv[3], 'utf8') : '';
const trace = process.argv.includes('--trace');
const t = Date.now();
const r = CI.run(src, { stdin: inp, trace });
if (r.compileError) console.log('COMPILE ERROR line', r.compileError.line + ':', r.compileError.message);
process.stdout.write(r.stdout || '');
if (r.error) console.log('\nRUNTIME ERROR line', r.error.line + ':', r.error.message);
for (const w of r.warnings || []) console.log('warning line', w.line + ':', w.msg);
console.log(`[${Date.now() - t} ms, ${r.steps} steps${trace ? ', ' + r.trace.length + ' snapshots' : ''}]`);
if (trace && process.argv.includes('--dump')) console.log(JSON.stringify(r.trace.slice(0, 6), null, 1));
