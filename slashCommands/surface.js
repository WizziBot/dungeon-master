const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const memberRoleId = '1032733231205843136';
const deanonId = '1032697010496737360';
const viewperm = PermissionFlagsBits.ViewChannel;

const data = new SlashCommandBuilder()
                .setName('surface')
                .setDescription('Leave the Dungeon and breach the surface.')
                .setDefaultMemberPermissions(PermissionFlagsBits.SendTTSMessages);

module.exports = {
    name: 'surface',
	data: data,
	async execute(interaction) {
		try{

            if(interaction.member.roles.cache.has(memberRoleId)){
                interaction.reply({content:'The Dungeon Master shall escort you...', ephemeral:true})
                setTimeout(()=>{
                    interaction.member.roles.remove(memberRoleId);
                    interaction.member.roles.add(deanonId);
                    //Edit perms of dungeon channel
                    interaction.channel.edit({permissionOverwrites:[
                        {
                            id:interaction.member.guild.roles.everyone.id,
                            deny: [viewperm]
                        },
                        {
                            id:interaction.member.id,
                            deny: [viewperm]
                        }
                    ]});
                    //Kick from audio channel
                    interaction.member.voice.disconnect();
                },2000)
            }

        } catch(e){
            interaction.reply({content:'Unknown Error.'});
        }
	},
};