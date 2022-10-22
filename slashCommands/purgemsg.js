const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const dungeonCategoryId = '1032563266171457546';

const data = new SlashCommandBuilder()
                .setName('purgemsg')
                .setDescription('Purge N messages from Dungeon.')
                .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
                .addIntegerOption(option=>
                    option.setName('messages')
                          .setDescription('Number of messages.')
                          .setRequired(true)
                );

module.exports = {
    name: 'purgemsg',
	data: data,
	async execute(interaction) {
        try{
            const numMsg = interaction.options.get('messages').value;
            const dungeonChannels = interaction.guild.channels.cache.get(dungeonCategoryId).children.cache;
            dungeonChannels.forEach(ch=>{
                ch.bulkDelete(numMsg);
            });
            interaction.reply({content:`Purged ${numMsg} messages.`,ephemeral:true});
        } catch(e) {
            console.trace(e);
            interaction.reply({content:'Unknown Error',ephemeral:true});
        }
	},
};