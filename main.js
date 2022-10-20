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
    'purple': '1032376123755085925',
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

let allWebhooks = require('./webhooks.json');

const dungeonCategoryId = '1032563266171457546';
const exemptRoleId = '1032567381584793621';

client.scommands = new Discord.Collection();
const scommandFiles = fs.readdirSync('./slashCommands/').filter(file => file.endsWith('.js'));
for(const sfile of scommandFiles){
    const command = require(`./slashCommands/${sfile}`);

    client.scommands.set(command.name, command);
}

let memberChannels = require('./memberChannels.json');

async function broadcastMsg(msg){
    // console.log(msg.content)
    client.guilds.cache.forEach(async guild=>{
        let colour = '';
        const keys = await msg.member.roles.cache.keys()
        if (msg.member.roles.cache.size > 0){
            for (let id of keys){
                colour = colourAv[id];
                if (colour !== '') break;
            }
        }
        if (colour == ''){colour = 'R'}

        Object.entries(allWebhooks).forEach((entry,other) =>{
            const cid = entry[0]
            const col = entry[1]
            if (msg.channelId == cid) return;
            console.log(cid)
            console.log(col[colour])
            guild.channels.fetch(cid).then(ch=>{
                ch.fetchWebhooks().then(whs=>{
                    whs.get(col[colour]).send({
                        content: msg.content,
                        attachments: msg.attachments,
                        username: 'Creature',
                    });
                }).catch(console.error);
            }).catch(console.error);
        });
    });
}

async function writeWebhooks(){
    const data = JSON.stringify(allWebhooks,null,4);
    fs.writeFile('./webhooks.json',data,(err)=>{
        if (err) console.trace(err);
    });
}

async function writeChannels(){
    const data = JSON.stringify(memberChannels,null,4);
    fs.writeFile('./memberChannels.json',data,(err)=>{
        if (err) console.trace(err);
    });
}

async function slog(str){
    console.log(str);
}

async function chatSay(id,msgContent){
    client.guilds.cache.forEach(async guild=>{
        const whs = await guild.channels.cache.get(id).fetchWebhooks();
        whs.forEach(wh=>{
            wh.send({
                content: msgContent,
                username: 'Mysterious Voice',
            });
        });
    });
}
const drearySpeech = `You are in a dungeon, he has brought you here. You know not with whomst you speak, nor how many lost souls thou may find fellowship with.
It is a miserable place... but in misery lies hope, the goals of the Dungeon Master - fine mysteries that man hath yet to solve - need not be known at present time.
It is thine right to change the colour of soul, the Dungeon Master would see to it that your urges are sated.
Should you wish to breach the surface and be relieved the veil of shadow, you may consult the Dungeon Master - ever watchful.`

client.once(Discord.Events.ClientReady, async client => {
    console.log('DUNGEON MASTER ONLINE');
    client.guilds.cache.forEach(async guild => {
        const channels = guild.channels.cache.filter(c=>(c.type == Discord.ChannelType.GuildText) && (c.parentId == dungeonCategoryId));
        const mcValues = Object.values(memberChannels);
        channels.forEach(c=>{
            if (mcValues.includes(c.id)) return;
            let members = c.members.filter(m=>(!m.roles.cache.has(exemptRoleId) || c.id == '1032592281502486538')).map(m=>{return m.user.id});
            
            if (members.length > 0) {
                memberChannels[members[0]]=c.id;
                slog(`Added member ${members[0].user.tag}`)
            }
        });
        writeChannels();

        let counter = 0
        channels.forEach(async c => {

            counter++;
            let webhooks = await c.fetchWebhooks();
            // move this to when the channel is created
            if(allWebhooks.hasOwnProperty(c.id)) return;
            if(webhooks.size == 7 && !allWebhooks.hasOwnProperty(c.id)){
                allWebhooks[c.id] = {};
                webhooks.forEach(wh=>{
                    allWebhooks[c.id][wh.name] = wh.id;
                });
                // console.log(allWebhooks)
                if (counter == channels.size) {writeWebhooks()};
                return;
            }

            if (webhooks.size == 0){
                allWebhooks[c.id] = {};
                Object.values(colourAv).forEach(async col => {
                    c.createWebhook({
                        name: col,
                        avatar: `./colour_avatars/${col}.png`
                    }).then(wh => {
                        slog('Spawned a Creature ' + col);
                        allWebhooks[c.id][col] = wh.id;
                    }).catch(console.error);
                });
            } else if (webhooks.size != 0 && webhooks.size < 7){
                webhooks.forEach(async w => {w.delete()});
                allWebhooks[c.id] = {};
                Object.values(colourAv).forEach(async col => {
                    c.createWebhook({
                        name: col,
                        avatar: `./colour_avatars/${col}.png`
                    }).then(wh => {
                        slog('Spawned a Creature ' + col);
                        allWebhooks[c.id][col] = wh.id;
                    }).catch(console.error);
                });
            }
            if (counter == channels.size) {setTimeout(()=>{writeWebhooks()},5000)};
        });
    });

});

client.on(Discord.Events.GuildMemberAdd, async member => {
    const dungeon = member.guild.channels.cache.get(dungeonCategoryId);
    let viewperm = Discord.PermissionsBitField.Flags = Discord.PermissionFlagsBits.ViewChannel;
    const newChannel = await dungeon.children.create({
        name:member.user.tag,
        permissionOverwrites:[
            {
                id:member.guild.roles.everyone.id,
                deny: [viewperm]
            },
            {
                id:member.id,
                allow: [viewperm]
            }
        ]
    });
    
    //Create all the webhooks for the channel
    let webhooks = await newChannel.fetchWebhooks();
    if(allWebhooks.hasOwnProperty(newChannel.id)) return;
    if(webhooks.size == 7 && !allWebhooks.hasOwnProperty(newChannel.id)){
        allWebhooks[newChannel.id] = {};
        webhooks.forEach(wh=>{
            allWebhooks[newChannel.id][wh.name] = wh.id;
        });
        if (counter == channels.size) {writeWebhooks()};
        return;
    }
    if (webhooks.size == 0){
        allWebhooks[newChannel.id] = {};
        Object.values(colourAv).forEach(async col => {
            newChannel.createWebhook({
                name: col,
                avatar: `./colour_avatars/${col}.png`
            }).then(wh => {
                slog('Spawned a Creature ' + col);
                allWebhooks[newChannel.id][col] = wh.id;
            }).catch(console.error);
        });
    } else if (webhooks.size != 0 && webhooks.size < 7){
        webhooks.forEach(async w => {w.delete()});
        allWebhooks[newChannel.id] = {};
        Object.values(colourAv).forEach(async col => {
            newChannel.createWebhook({
                name: col,
                avatar: `./colour_avatars/${col}.png`
            }).then(wh => {
                slog('Spawned a Creature ' + col);
                allWebhooks[newChannel.id][col] = wh.id;
            }).catch(console.error);
        });
    }
    setTimeout(()=>{writeChannels()},5000);
});

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
    if(message.channel.parentId != dungeonCategoryId) return;

    broadcastMsg(message);
});

client.login('MTAzMjM2OTI5NzYzODU2MzkzMw.GOZvof.OXvN3AdEab7EeOTHuBmkKlm2CsgGSI7CrqytQg');