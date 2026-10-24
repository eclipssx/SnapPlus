const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
  ]
});

const PREFIX = '+';
const COLOR = 0x7c3aed;
const ERROR_COLOR = 0xef4444;
const SUCCESS_COLOR = 0x22c55e;

// ─── READY ────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('+help | Snap+', { type: 2 });
});

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ── HELP ──────────────────────────────────────────────────────────────────
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📋 Liste des commandes')
      .setColor(COLOR)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '🛡️ Modération', value:
          '`+ban @user [raison]` — Bannir un membre\n' +
          '`+unban <userID>` — Débannir un utilisateur\n' +
          '`+kick @user [raison]` — Expulser un membre\n' +
          '`+mute @user [durée] [raison]` — Rendre muet\n' +
          '`+unmute @user` — Retirer le mute\n' +
          '`+warn @user [raison]` — Avertir un membre\n' +
          '`+warns @user` — Voir les avertissements\n' +
          '`+clearwarns @user` — Effacer les warns'
        },
        { name: '🧹 Gestion du salon', value:
          '`+clear [nombre]` — Supprimer des messages (défaut: 10)\n' +
          '`+lock` — Verrouiller le salon\n' +
          '`+unlock` — Déverrouiller le salon\n' +
          '`+slowmode [secondes]` — Activer le slowmode'
        },
        { name: '👤 Gestion des membres', value:
          '`+userinfo @user` — Infos sur un membre\n' +
          '`+avatar @user` — Avatar d\'un membre\n' +
          '`+addrole @user @role` — Ajouter un rôle\n' +
          '`+removerole @user @role` — Retirer un rôle\n' +
          '`+nickname @user [pseudo]` — Changer le pseudo'
        },
        { name: '🖥️ Serveur', value:
          '`+serverinfo` — Infos sur le serveur\n' +
          '`+botinfo` — Infos sur le bot\n' +
          '`+ping` — Latence du bot\n' +
          '`+announce #salon [message]` — Faire une annonce'
        }
      )
      .setFooter({ text: `Prefix: ${PREFIX} • Snap+ Bot` })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // ── PING ──────────────────────────────────────────────────────────────────
  if (command === 'ping') {
    const msg = await message.reply('🏓 Calcul...');
    const latency = msg.createdTimestamp - message.createdTimestamp;
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(SUCCESS_COLOR)
      .addFields(
        { name: 'Bot', value: `**${latency}ms**`, inline: true },
        { name: 'API', value: `**${client.ws.ping}ms**`, inline: true }
      );
    return msg.edit({ content: null, embeds: [embed] });
  }

  // ── BOTINFO ───────────────────────────────────────────────────────────────
  if (command === 'botinfo') {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const embed = new EmbedBuilder()
      .setTitle('🤖 Infos du bot')
      .setColor(COLOR)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'Nom', value: client.user.tag, inline: true },
        { name: 'ID', value: client.user.id, inline: true },
        { name: 'Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Uptime', value: `${h}h ${m}m ${s}s`, inline: true },
        { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Node.js', value: process.version, inline: true }
      )
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // ── SERVERINFO ────────────────────────────────────────────────────────────
  if (command === 'serverinfo') {
    const guild = message.guild;
    const embed = new EmbedBuilder()
      .setTitle(`🖥️ ${guild.name}`)
      .setColor(COLOR)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Membres', value: `${guild.memberCount}`, inline: true },
        { name: 'Salons', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount}`, inline: true },
        { name: 'Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
      )
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // ── USERINFO ──────────────────────────────────────────────────────────────
  if (command === 'userinfo') {
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${target.user.tag}`)
      .setColor(COLOR)
      .setThumbnail(target.user.displayAvatarURL())
      .addFields(
        { name: 'ID', value: target.id, inline: true },
        { name: 'Pseudo', value: target.displayName, inline: true },
        { name: 'Bot', value: target.user.bot ? 'Oui' : 'Non', inline: true },
        { name: 'Rejoint le', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: 'Compte créé', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Rôles', value: target.roles.cache.filter(r => r.id !== message.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'Aucun', inline: false }
      )
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }

  // ── AVATAR ────────────────────────────────────────────────────────────────
  if (command === 'avatar') {
    const target = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar de ${target.username}`)
      .setColor(COLOR)
      .setImage(target.displayAvatarURL({ size: 512 }));
    return message.reply({ embeds: [embed] });
  }

  // ── CLEAR ─────────────────────────────────────────────────────────────────
  if (command === 'clear') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return sendError(message, 'Tu n\'as pas la permission `Gérer les messages`.');
    const amount = parseInt(args[0]) || 10;
    if (amount < 1 || amount > 100)
      return sendError(message, 'Nombre entre 1 et 100.');
    await message.channel.bulkDelete(amount + 1, true).catch(() => {});
    const msg = await message.channel.send(successEmbed(`🧹 **${amount}** messages supprimés.`));
    setTimeout(() => msg.delete().catch(() => {}), 3000);
    return;
  }

  // ── BAN ───────────────────────────────────────────────────────────────────
  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
      return sendError(message, 'Tu n\'as pas la permission `Bannir des membres`.');
    const target = message.mentions.members.first();
    if (!target) return sendError(message, 'Mentionne un membre à bannir.');
    if (!target.bannable) return sendError(message, 'Je ne peux pas bannir ce membre.');
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    await target.ban({ reason, deleteMessageDays: 1 });
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`🔨 **${target.user.tag}** a été banni.\n📝 Raison : ${reason}`)] });
  }

  // ── UNBAN ─────────────────────────────────────────────────────────────────
  if (command === 'unban') {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
      return sendError(message, 'Tu n\'as pas la permission `Bannir des membres`.');
    const userId = args[0];
    if (!userId) return sendError(message, 'Fournis un ID utilisateur.');
    await message.guild.members.unban(userId).catch(() => sendError(message, 'Utilisateur introuvable ou non banni.'));
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`✅ Utilisateur \`${userId}\` débanni.`)] });
  }

  // ── KICK ──────────────────────────────────────────────────────────────────
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers))
      return sendError(message, 'Tu n\'as pas la permission `Expulser des membres`.');
    const target = message.mentions.members.first();
    if (!target) return sendError(message, 'Mentionne un membre à expulser.');
    if (!target.kickable) return sendError(message, 'Je ne peux pas expulser ce membre.');
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    await target.kick(reason);
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`👢 **${target.user.tag}** a été expulsé.\n📝 Raison : ${reason}`)] });
  }

  // ── MUTE ──────────────────────────────────────────────────────────────────
  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return sendError(message, 'Tu n\'as pas la permission `Modérer les membres`.');
    const target = message.mentions.members.first();
    if (!target) return sendError(message, 'Mentionne un membre.');
    const dureeArg = args[1];
    let ms = 10 * 60 * 1000; // 10 min défaut
    if (dureeArg) {
      const val = parseInt(dureeArg);
      if (dureeArg.endsWith('s')) ms = val * 1000;
      else if (dureeArg.endsWith('h')) ms = val * 3600000;
      else if (dureeArg.endsWith('j') || dureeArg.endsWith('d')) ms = val * 86400000;
      else ms = val * 60000; // minutes par défaut
    }
    const reason = args.slice(2).join(' ') || 'Aucune raison fournie';
    await target.timeout(ms, reason);
    const dureeStr = dureeArg || '10m';
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`🔇 **${target.user.tag}** a été rendu muet pendant **${dureeStr}**.\n📝 Raison : ${reason}`)] });
  }

  // ── UNMUTE ────────────────────────────────────────────────────────────────
  if (command === 'unmute') {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return sendError(message, 'Tu n\'as pas la permission `Modérer les membres`.');
    const target = message.mentions.members.first();
    if (!target) return sendError(message, 'Mentionne un membre.');
    await target.timeout(null);
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`🔊 **${target.user.tag}** n'est plus muet.`)] });
  }

  // ── WARN ──────────────────────────────────────────────────────────────────
  const warns = {}; // stockage en mémoire (resets au redémarrage)
  if (command === 'warn') {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return sendError(message, 'Tu n\'as pas la permission.');
    const target = message.mentions.members.first();
    if (!target) return sendError(message, 'Mentionne un membre.');
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    if (!warns[target.id]) warns[target.id] = [];
    warns[target.id].push({ reason, date: new Date().toLocaleString('fr-FR') });
    return message.reply({ embeds: [new EmbedBuilder().setColor(0xf59e0b).setDescription(`⚠️ **${target.user.tag}** a reçu un avertissement.\n📝 Raison : ${reason}\n🔢 Total : **${warns[target.id].length}** warn(s)`)] });
  }

  if (command === 'warns') {
    const target = message.mentions.members.first() || message.member;
    const userWarns = warns[target.id] || [];
    if (userWarns.length === 0)
      return message.reply({ embeds: [new EmbedBuilder().setColor(COLOR).setDescription(`✅ **${target.user.tag}** n'a aucun avertissement.`)] });
    const list = userWarns.map((w, i) => `**${i+1}.** ${w.reason} — *${w.date}*`).join('\n');
    return message.reply({ embeds: [new EmbedBuilder().setColor(0xf59e0b).setTitle(`⚠️ Avertissements de ${target.user.tag}`).setDescription(list)] });
  }

  if (command === 'clearwarns') {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return sendError(message, 'Tu n\'as pas la permission.');
    const target = message.mentions.members.first();
    if (!target) return sendError(message, 'Mentionne un membre.');
    warns[target.id] = [];
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`✅ Avertissements de **${target.user.tag}** effacés.`)] });
  }

  // ── LOCK ──────────────────────────────────────────────────────────────────
  if (command === 'lock') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return sendError(message, 'Tu n\'as pas la permission `Gérer les salons`.');
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription(`🔒 Salon **#${message.channel.name}** verrouillé.`)] });
  }

  // ── UNLOCK ────────────────────────────────────────────────────────────────
  if (command === 'unlock') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return sendError(message, 'Tu n\'as pas la permission `Gérer les salons`.');
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`🔓 Salon **#${message.channel.name}** déverrouillé.`)] });
  }

  // ── SLOWMODE ──────────────────────────────────────────────────────────────
  if (command === 'slowmode') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
      return sendError(message, 'Tu n\'as pas la permission `Gérer les salons`.');
    const seconds = parseInt(args[0]) || 0;
    await message.channel.setRateLimitPerUser(seconds);
    const txt = seconds === 0 ? 'désactivé' : `**${seconds}s**`;
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`⏱️ Slowmode ${txt} dans **#${message.channel.name}**.`)] });
  }

  // ── ADDROLE ───────────────────────────────────────────────────────────────
  if (command === 'addrole') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return sendError(message, 'Tu n\'as pas la permission `Gérer les rôles`.');
    const target = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!target || !role) return sendError(message, 'Mentionne un membre et un rôle.');
    await target.roles.add(role);
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`✅ Rôle <@&${role.id}> ajouté à **${target.user.tag}**.`)] });
  }

  // ── REMOVEROLE ────────────────────────────────────────────────────────────
  if (command === 'removerole') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return sendError(message, 'Tu n\'as pas la permission `Gérer les rôles`.');
    const target = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!target || !role) return sendError(message, 'Mentionne un membre et un rôle.');
    await target.roles.remove(role);
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`✅ Rôle <@&${role.id}> retiré à **${target.user.tag}**.`)] });
  }

  // ── NICKNAME ──────────────────────────────────────────────────────────────
  if (command === 'nickname' || command === 'nick') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames))
      return sendError(message, 'Tu n\'as pas la permission `Gérer les pseudos`.');
    const target = message.mentions.members.first();
    if (!target) return sendError(message, 'Mentionne un membre.');
    const nick = args.slice(1).join(' ') || null;
    await target.setNickname(nick);
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`✅ Pseudo de **${target.user.tag}** changé en **${nick || 'réinitialisé'}**.`)] });
  }

  // ── ANNOUNCE ──────────────────────────────────────────────────────────────
  if (command === 'announce' || command === 'ann') {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return sendError(message, 'Tu n\'as pas la permission.');
    const channel = message.mentions.channels.first();
    if (!channel) return sendError(message, 'Mentionne un salon.');
    const text = args.slice(1).join(' ');
    if (!text) return sendError(message, 'Écris un message.');
    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle('📢 Annonce')
      .setDescription(text)
      .setFooter({ text: `Annonce par ${message.author.tag}` })
      .setTimestamp();
    await channel.send({ embeds: [embed] });
    return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription(`✅ Annonce envoyée dans <#${channel.id}>.`)] });
  }
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function sendError(message, text) {
  return message.reply({ embeds: [new EmbedBuilder().setColor(0xef4444).setDescription(`❌ ${text}`)] });
}

function successEmbed(text) {
  return { embeds: [new EmbedBuilder().setColor(0x22c55e).setDescription(text)] };
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const TOKEN = 'MTQ5NzYzNDQ4Nzc3MTczMDExNA.GwCyYx.DvSOFZtrVdQ2O3Rz119RgMbu6ShlfKeD-m_q6w';
client.login(TOKEN);
