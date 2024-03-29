const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
                .setName('colours')
                .setDescription('Lists assignable colours.');

module.exports = {
    name: 'colours',
	data: data,
	async execute(interaction) {
		const Discord = require('discord.js');
        try{
            var i;
            var cc = '';
            const keys = Object.keys(colours);
            for(i = 0; i < keys.length; i++){
                cc = `${cc}\n\`${keys[i]}\``;
            }
            cc = cc.slice('1');
            colorsEmbed = new Discord.EmbedBuilder()
                    .setColor('#000000')
                    // .setTitle('Avalible Colors')
                    // .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL()})
                    .addFields(
                        { name: 'All colours', value: cc, inline: true},
                    )
                    // .setTimestamp()
            interaction.reply({embeds: [colorsEmbed],ephemeral: true});
        } catch(e){
            console.log(e);
            interaction.reply({content:'Unknown Error.'});
        }
	},
};