const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [ Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.AutoModerationConfiguration, Discord.GatewayIntentBits.AutoModerationExecution, Discord.GatewayIntentBits.GuildPresences ]
});  
const prefix = '-';
const fs = require('fs');

//adjust colours to emoji colours
const colours = {
    'red': '1032375800256811018',
    'green': '1032376058936303637',
    'blue': '1032376087847632948',
    'violet': '1032376123755085925',
    'cyan': '1032376250888634440',
    'yellow': '1032376199835566110',
    'indigo': '1032376577570394143',
};
const colourAv = {
    '1032375800256811018':'R',
    '1032376058936303637':'G',
    '1032376087847632948':'B',
    '1032376123755085925':'P',
    '1032376250888634440':'C',
    '1032376199835566110':'Y',
    '1032376577570394143':'I',
}

const dungeonChannelId = '1032563266171457546';
const exemptRoleId = '1032567381584793621';

client.scommands = new Discord.Collection();
const scommandFiles = fs.readdirSync('./slashCommands/').filter(file => file.endsWith('.js'));
for(const sfile of scommandFiles){
    const command = require(`./slashCommands/${sfile}`);

    client.scommands.set(command.name, command);
}

let memberChannels = {};

async function broadcastMsg(msg){
    client.guilds.cache.forEach(async guild=>{
        let colour = '';
        const keys = await msg.member.roles.cache.keys()
        for (let id of keys){
            colour = colourAv[id];
            if (colour !== '') break;
        }
        // console.log(colour);
        if (colour == ''){colour = 'R'}
        guild.channels.cache.filter(c=>(c.type == Discord.ChannelType.GuildText) && (c.parentId == dungeonChannelId) && (c.id != memberChannels[msg.author.id])).forEach(async c => {
            c.fetchWebhooks().then(async whs => {
                whs.forEach(async wh=>{
                    if (wh.name == colour ){
                        await wh.send({
                            content: msg.content,
                            username: 'Creature',
                        });
                    }
                });
            });
        });
    });
}

client.once(Discord.Events.ClientReady, async client => {
    console.log('DUNGEON MASTER ONLINE');

    client.guilds.cache.forEach(async guild => {
        guild.channels.cache.filter(c=>(c.type == Discord.ChannelType.GuildText) && (c.parentId == dungeonChannelId)).forEach(async c => {
            let members = c.members.filter(m=>(!m.roles.cache.has(exemptRoleId) || c.id == '1032592281502486538')).map(m=>{return m.user.id});
            
            if (members.length > 0) {memberChannels[members[0]]=c.id}
            // move this to when the channel is created
            let webhooks = await c.fetchWebhooks();
            // webhooks.forEach(async w => {w.delete()})
            if (webhooks.size == 0){
                Object.values(colourAv).forEach(col => {
                    c.createWebhook({
                        name: col,
                        avatar: `./colour_avatars/${col}.png`
                    }).then(() => console.log('Spawned a Creature'))
                    .catch(console.error);
                });
            }
        });
    });
    // console.log(memberChannels)
});

// client.on(Discord.Events.GuildMemberAdd, async member => {
    
// });

client.on(Discord.Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

	const command = client.scommands.get(interaction.commandName);

	if (!command) return;

	try {
        if (interaction.commandName == 'colour' || interaction.commandName == 'colours') {
            await command.execute(interaction,colours);
        } else {
            await command.execute(interaction);
        }
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate', async message => {
    if(message.guild === null || message.author.bot) return;
    if(message.channel.parentId != dungeonChannelId) return;

    broadcastMsg(message);
});

client.login('MTAzMjM2OTI5NzYzODU2MzkzMw.GOZvof.OXvN3AdEab7EeOTHuBmkKlm2CsgGSI7CrqytQg');