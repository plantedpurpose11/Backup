const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

var generateID = () => {
  let text = "";
  let digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; 15 > i; i++)
    text += digits.charAt(Math.floor(Math.random() * digits.length));
  return text;
}

// Helper to iterate over any collection-like
const iterChannels = (channels) => {
  if (typeof channels === 'undefined') return [];
  if (Array.isArray(channels)) return channels;
  if (typeof channels.array === 'function') return channels.array();
  if (typeof channels.values === 'function') return [...channels.values()];
  if (typeof channels[Symbol.iterator] === 'function') return [...channels];
  return [];
};

module.exports = class extends Task {
    constructor(...args) {
        super(...args, { name: 'backup', enabled: true });
    }

    async run(g2=null, owner=null) {
      let old = JSON.parse(this.client.settings.backups)
      if (g2 !== null) {
        let g = g2.toJSON();
        // Add some detail
        g.channels = [];
        for (let ch of iterChannels(g2.channels)) {
          let n = ch.toJSON();
          if (ch.parent) n.parent = ch.parent.name;
          n.permissionOverwrites = ch.permissionOverwrites.map(x => {
            let y = x.toJSON();
            if (y.type == "role") y.role = g2.roles.get(y.id).name;
            return y;
          });
          g.channels.push(n)
        }
        g.emojis = g2.emojis.toJSON();
        g.roles = g2.roles.toJSON();
        g.members = [];
        let mem = await g2.members.fetch();
        const iterMembers = (m) => {
          if (Array.isArray(m)) return m;
          if (typeof m.array === 'function') return m.array();
          if (typeof m.values === 'function') return [...m.values()];
          if (typeof m[Symbol.iterator] === 'function') return [...m];
          return [];
        };
        for (let member of iterMembers(mem)) {
          let n = {};
          n.roles = [...member.roles.values()];
          n.nickname = member.nickname;
          n.user = {id: member.user.id}
          g.members.push(n)
        }

        delete g.client;
        delete g.settings;

        var found = false;
        var id;
        for (let x = 0; x < old.length; x++) {
          if (old[x].id === g.id) {
            g.backupID = old[x].backupID
            old[x] = g;

            // Send Message
            let e = new MessageEmbed()
            .setColor(0xff0050)
            .setDescription(`Here's your backup ID: \`${g.backupID}\`.\nKeep this in a safe place.`)
            try {
              await owner.send(e);
            } catch(err) {
              console.error('DM error:', err);
            }
            id = g.backupID;
            found = true
          }
        }
        if (!found) {
          g.backupID = generateID();

          // Send Message
          let e = new MessageEmbed()
          .setColor(0xff0050)
          .setDescription(`Here's your backup ID: \`${g.backupID}\`.\nKeep this in a safe place.`)
          try {
            await owner.send(e);
          } catch(err) {
            console.error('DM error:', err);
          }
          id = g.backupID;
        }
        
        if (id) {
          this.client.settings.update("backups", JSON.stringify(old));
          return id;
        }
      } else {
        for(let guild of [...this.client.guilds.values()]) {
          console.log(guild.name)
          let g = guild.toJSON();

          // Add some detail
          g.channels = [];
          for (let ch of iterChannels(guild.channels)) {
            let n = ch.toJSON();
            if (ch.parent) n.parent = ch.parent.name;
            n.permissionOverwrites = ch.permissionOverwrites.map(x => {
              let y = x.toJSON();
              if (y.type == "role") y.role = guild.roles.get(y.id).name;
              return y;
            });
            console.log(n.permissionOverwrites)
            g.channels.push(n)
          }
          g.emojis = guild.emojis.toJSON();
          g.roles = guild.roles.toJSON();
          g.members = [...guild.members.values()];
          delete g.client;
          var found = false;
          for (let oldg of old) {
            if (oldg.id === g.id) {
              oldg = g;
              found = true
            }
          }
          if (!found) old.push(g);
        }
      }
      return this.client.settings.update("backups", JSON.stringify(old));
    }
};
