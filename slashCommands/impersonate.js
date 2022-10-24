const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
                .setName('impersonate')
                .setDescription('Become an imposter.')
                .addStringOption(option =>
                    option.setName('mode').setDescription("Toggle or switch impersonation.").setRequired(true)
                    .addChoices(
                        { name: 'toggle', value:  '1' },
                        { name: 'change', value:  '2' },
                    )
                );
const imposterRoleId = '1034139467356852244';

module.exports = {
    name: 'impersonate',
	data: data,
	async execute(interaction,impersonationMap,memberList,writeChanges,config) {
		try{
            if (!config['impersonation']){
                interaction.reply({content:'Feature disabled.',ephemeral:true});
                return;
            }
            const choice = interaction.options.get('mode');
            const isImp = interaction.member.roles.cache.has(imposterRoleId)
            if(choice.value == '1' && isImp){
                interaction.member.roles.remove(imposterRoleId);
                interaction.reply({content:'No longer are you an imposter.', ephemeral:true});
                return;
            } else if (choice.value == '2' || (choice.value == '1' && !isImp)){
                if (impersonationMap.hasOwnProperty(interaction.member.id)){
                    if (!impersonationMap[interaction.member.id][1]){
                        interaction.reply({content:'You are on cooldown.',ephemeral:true});
                        return;
                    }
                }
                interaction.member.roles.add(imposterRoleId);
                const rndMember = memberList[Math.floor(Math.random()*memberList.length)];
                impersonationMap[interaction.member.id] = [rndMember,false];
                interaction.reply({content:`You are impersonating ${rndMember}`, ephemeral:true});
                setTimeout(()=>{
                    impersonationMap[interaction.member.id] = [rndMember,true];
                },60000);
            }

        } catch(e){
            interaction.reply({content:'Unknown Error.',ephemeral:true});
            console.trace(e);
        }
	},
};