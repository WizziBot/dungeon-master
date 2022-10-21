const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const data = new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Replies with Pong!')
                .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog);

module.exports = {
    name: 'ping',
	data: data,
	async execute(interaction) {
		await interaction.reply({content:'Pong!',ephemeral:true});
	},
};