const { expressCommand } = require('./express/expressCommand');
const { analyzeCommand } = require('./analyze/analyzeCommand');
const { summarizeCommand } = require('./summarize/summarizeCommand');

// Array of Command objects
const cmds = [expressCommand, analyzeCommand, summarizeCommand];
exports.cmds = cmds;
