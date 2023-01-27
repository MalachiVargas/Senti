const { expressCommand } = require('./express/expressCommand');
const { analyzeCommand } = require('./analyze/analyzeCommand');
const { summarizeCommand } = require('./summarize/summarizeCommand');
const { chatCommand } = require('./chat/chatCommand');

// Array of Command objects
const cmds = [expressCommand, analyzeCommand, summarizeCommand, chatCommand];
exports.cmds = cmds;
