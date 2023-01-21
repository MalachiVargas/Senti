const { pingCommand } = require('./ping/pingCommand');
const { suggestCommand } = require('./suggest/suggestCommand');
const { summarizeCommand } = require('./summarize/summarizeCommand');

// Array of Command objects
const cmds = [suggestCommand, pingCommand, summarizeCommand];
exports.cmds = cmds;
