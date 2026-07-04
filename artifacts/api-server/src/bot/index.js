import pkg from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = pkg;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
  ],
});

const commands = [
  {
    name: 'selfroles',
    description: 'Get the role selection embed',
  },
  {
    name: 'omi',
    description: 'UwU~!!',
  },
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Slash command registered.');
  } catch (error) {
    console.error('Failed to register slash command:', error);
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand() && interaction.commandName === 'omi') {
    return interaction.reply('UwU~!!');
  }

  if (interaction.isCommand() && interaction.commandName === 'selfroles') {
    const embed = new MessageEmbed()
      .setTitle('Pick your roles')
      .setDescription('Click on any of the roles below. You can always change them later!')
      .setColor('#0099ff');

    const row1 = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('Inhouse Role').setLabel('Inhouse Role').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Left Wing').setLabel('Left Wing').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Right Wing').setLabel('Right Wing').setStyle('PRIMARY')
    );

    const row2 = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('Setter').setLabel('Setter').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Third Spiker').setLabel('Third Spiker').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Libero').setLabel('Libero').setStyle('PRIMARY'),
      new MessageButton().setCustomId('Spectator').setLabel('Spectator').setStyle('SECONDARY')
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2] });
  }

  if (interaction.isButton()) {
    const role = interaction.guild.roles.cache.find((r) => r.name === interaction.customId);
    const member = interaction.member;

    if (!role) {
      return interaction.reply({ content: 'Role not found!', ephemeral: true });
    }

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      await interaction.user.send(`❌ Removed role: ${role.name}`);
      await interaction.reply({ content: `Removed ${role.name}`, ephemeral: true });
    } else {
      await member.roles.add(role);
      await interaction.user.send(`✅ Added role: ${role.name}`);
      await interaction.reply({ content: `Added ${role.name}`, ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
