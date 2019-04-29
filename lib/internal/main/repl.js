'use strict';

// Create the REPL if `-i` or `--interactive` is passed, or if
// the main module is not specified and stdin is a TTY.

const {
  prepareMainThreadExecution
} = require('internal/bootstrap/pre_execution');

const {
  evalScript
} = require('internal/process/execution');

const { print, kStderr, kStdout } = require('internal/util/print');

const { getOptionValue } = require('internal/options');

prepareMainThreadExecution();

markBootstrapComplete();

// --input-type flag not supported in REPL
if (getOptionValue('--input-type')) {
  print(kStderr, 'Cannot specify --input-type for REPL');
  process.exit(1);
}

print(kStdout, `Welcome to Node.js ${process.version}.\n` +
               'Type ".help" for more information.');

const cliRepl = require('internal/repl');
cliRepl.createInternalRepl(process.env, (err, repl) => {
  if (err) {
    throw err;
  }
  repl.on('exit', () => {
    if (repl._flushing) {
      repl.pause();
      return repl.once('flushHistory', () => {
        process.exit();
      });
    }
    process.exit();
  });
});

// If user passed '-e' or '--eval' along with `-i` or `--interactive`,
// evaluate the code in the current context.
const source = getOptionValue('--eval');
if (source != null) {
  evalScript('[eval]',
             source,
             getOptionValue('--inspect-brk'),
             getOptionValue('--print'));
}
