const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Configurations
const REQUEST_CHANNEL_ID = 'YOUR_REQUEST_CHANNEL_ID'; // Channel where requests go
const AUTHORIZED_ROLE_ID = 'YOUR_AUTHORIZED_ROLE_ID'; // Role that can approve/deny

// Register slash command
client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);
    const commandData = new SlashCommandBuilder()
        .setName('requestrole')
        .setDescription('Request a role')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role you want to request')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for requesting this role')
                .setRequired(true));

    await client.application.commands.set([commandData.toJSON()]);
});

// Handle slash command
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'requestrole') {
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason');
        const user = interaction.user;

        // Send request to the designated channel
        const requestChannel = interaction.guild.channels.cache.get(REQUEST_CHANNEL_ID);
        if (!requestChannel) {
            return interaction.reply({ content: 'Request channel not found!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Role Request')
            .setDescription(`**User:** ${user}\n**Requested Role:** ${role}\n**Reason:** ${reason}`)
            .setColor(0x0099ff)
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${user.id}_${role.id}`)
                    .setLabel('Approve')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_${user.id}`)
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Danger)
            );

        await requestChannel.send({ embeds: [embed], components: [buttons] });
        await interaction.reply({ content: 'Your role request has been sent for approval!', ephemeral: true });
    }
});

// Handle button clicks
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const [action, userId, roleId] = interaction.customId.split('_');

    if (!interaction.member.roles.cache.has(AUTHORIZED_ROLE_ID)) {
        return interaction.reply({ content: 'You are not authorized to approve/deny requests.', ephemeral: true });
    }

    const user = await interaction.guild.members.fetch(userId);
    if (!user) return interaction.reply({ content: 'User not found!', ephemeral: true });

    if (action === 'approve') {
        const role = await interaction.guild.roles.fetch(roleId);
        if (!role) return interaction.reply({ content: 'Role not found!', ephemeral: true });

        await user.roles.add(role);
        await user.send(`✅ Your request for the **${role.name}** role has been approved!`);
        await interaction.update({ content: `✅ **Approved** by ${interaction.user}!`, components: [] });
    }

    if (action === 'deny') {
        await user.send(`❌ Your role request has been **denied**.`);
        await interaction.update({ content: `❌ **Denied** by ${interaction.user}!`, components: [] });
    }
});

client.login(process.env.TOKEN);
