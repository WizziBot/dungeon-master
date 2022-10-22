const { SlashCommandBuilder } = require('discord.js');
const colours = require('../colours.json');

const data = new SlashCommandBuilder()
                .setName('colour')
                .setDescription('Assigns a colour or \'rainbow\' for random colours.')
                .addStringOption(option =>
                    option.setName('colour').setDescription("Select the colour of your soul.").setRequired(true)
                    .addChoices(
                        { name: 'red', value:    '1032375800256811018' },
                        { name: 'green', value:  '1032376058936303637' },
                        { name: 'blue', value:   '1032376087847632948' },
                        { name: 'purple', value: '1032376123755085925' },
                        { name: 'cyan', value:   '1032376250888634440' },
                        { name: 'yellow', value: '1032376199835566110' },
                        { name: 'indigo', value: '1032376577570394143' },
                        { name: 'rainbow', value:'1033424455034228806' },
                    )
                );

module.exports = {
    name: 'colour',
	data: data,
	async execute(interaction) {
		try{
            const choice = interaction.options.get('colour')

            const keys = Object.keys(colours);
            for(let i = 0; i < keys.length; i++){
                if(interaction.member.roles.cache.has(colours[keys[i]])){
                    interaction.member.roles.remove(colours[keys[i]]);
                }
            }

            interaction.member.roles.add(choice.value);

            if (choice.name == 'rainbow'){
                interaction.reply({content:'The taste of thine soul is everchanging.', ephemeral:true});
            } else {
                interaction.reply({content:'The taste of thine soul hath changed.', ephemeral:true});
            }

        } catch(e){
            interaction.reply({content:'Unknown Error.'});
        }
	},
};