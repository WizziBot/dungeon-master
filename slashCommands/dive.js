const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const memberRoleId = '1032733231205843136';
const deanonId = '1032697010496737360';
const viewperm = PermissionFlagsBits.ViewChannel;

const data = new SlashCommandBuilder()
                .setName('dive')
                .setDescription('Return to the Dungeon.')
                .setDefaultMemberPermissions(PermissionFlagsBits.CreatePrivateThreads);

module.exports = {
    name: 'dive',
	data: data,
	async execute(interaction,memberChannels) {
		try{

            if(interaction.member.roles.cache.has(deanonId)){
                interaction.reply({content:'The Dungeon Master shall escort you...', ephemeral:true});
                setTimeout(async ()=>{
                    //Edit perms of dungeon channel
                    let ch = await interaction.guild.channels.fetch(memberChannels[interaction.member.id]);
                    await ch.edit({permissionOverwrites:[
                        {
                            id:interaction.member.guild.roles.everyone.id,
                            deny: [viewperm]
                        },
                        {
                            id:interaction.member.id,
                            allow: [viewperm]
                        }
                    ]});
                    interaction.member.roles.remove(deanonId);
                    interaction.member.roles.add(memberRoleId);
                    //Kick from audio channel
                    interaction.member.voice.disconnect();
                },2000)
            }

        } catch(e){
            interaction.reply({content:'Unknown Error.'});
        }
	},
};