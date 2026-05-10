const fs = require('fs');
const path = require('path');

const clientFile = path.join(__dirname, 'node_modules/klasa/src/lib/Client.js');
let content = fs.readFileSync(clientFile, 'utf8');

// Replace the hardcoded permission with existing FLAGS
const newContent = content.replace(
    'KlasaClient.basePermissions = new Permissions(3072);',
    'KlasaClient.basePermissions = new Permissions([FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES]);'
);

fs.writeFileSync(clientFile, newContent);
console.log('Patched Klasa permissions');