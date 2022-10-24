const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
                .setName('impersonate')
                .setDescription('Impersonate random noobs.');

const imposterRoleId = '1034139467356852244';

module.exports = {
    name: 'impersonate',
	data: data,
	async execute(interaction) {
		try{
            // if(interaction.member.roles.cache.has(imposterRoleId)){
            //     interaction.member.roles.remove(imposterRoleId);
            //     interaction.reply({content:'No longer are you suspicious.', ephemeral:true});
            // } else {
            //     interaction.member.roles.add(imposterRoleId);
            //     interaction.reply({content:'Thou hast become suspicious.', ephemeral:true});
            // }
            interaction.reply({content:'Feature disabled temporarily.',ephemeral:true});

        } catch(e){
            interaction.reply({content:'Unknown Error.'});
        }
	},
};