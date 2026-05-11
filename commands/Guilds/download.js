const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: "Download a backup using its ID",
            permissionLevel: 6,
            usage: "[ID:string]"
        });
    }
    async run(message, [ID]) {
      let b = JSON.parse(message.client.settings.backups); console.log("Looking for:", ID, "in backups:", JSON.stringify(b.map(x => x.backupID)));
      let chosen = b.find(b => String(b.backupID) === String(ID)); console.log("Found:", chosen ? chosen.backupID : "null");
      if (!chosen) return message.channel.send(`❌ Invalid backup ID`);
      else message.delete();
      
      let buf = Buffer.from(JSON.stringify(chosen), 'utf8');
      
      if (message.guild) {
        message.author.send({files: [{attachment: buf, name: `backup-${ID}.json`}]}).then(() => 
          message.channel.send(`I have sent you a PM with the backup.`)
        ).catch(e => 
          message.channel.send(`I could not send you a PM. Check you have PMs enabled in settings.`)
        )
      } else {
        message.channel.send(`Here's your backup`, {files: [{attachment: buf, name: `backup-${ID}.json`}]})
      }
    }
};
