const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'colour',
	data: new SlashCommandBuilder()
		.setName('colour')
		.setDescription('Assigns colour.')
        .addStringOption(option =>
            option.setName('colour').setDescription("colour").setRequired(true)),
	async execute(interaction,colours) {
		try{
            const choice = interaction.options.get('colour')

            var i;
            const keys = Object.keys(colours);
            for(i = 0; i < keys.length; i++){
                if(interaction.member.roles.cache.has(colours[keys[i]])){
                    interaction.member.roles.remove(colours[keys[i]]);
                }
            }

            var u;
            var applied = false;
            var c2;
            for(u = 0; u < keys.length; u++){
                if(choice === keys[u]){
                    interaction.member.roles.add(colours[keys[u]]);
                    c2 = keys[u];
                    applied = true;
                }
            }
            if(choice == ''){
                interaction.channel.send(`Successfully cleared current color.`).then(msg => {
                    msg.delete({timeout:5000});
                });
                return
            }
            if(applied === false){
                interaction.channel.send('Please choose a valid color. `-colors` to see avalible colors.').then(msg => {
                    msg.delete({timeout:5000});
                });
                return;
            }
            
            interaction.channel.send(`Successfully applied the color \`${c2}\`.`).then(msg => {
                msg.delete({timeout:5000});
            });

        } catch(e){
            return interaction.channel.send('Unknown Error.');
        }
	},
};