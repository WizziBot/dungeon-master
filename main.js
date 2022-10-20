const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [ Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.AutoModerationConfiguration, Discord.GatewayIntentBits.AutoModerationExecution, Discord.GatewayIntentBits.GuildPresences ],
    partials: [Discord.Partials.GuildMember, Discord.Partials.User]
});  
const prefix = '-';
const fs = require('fs');

const drearySpeech = `You are in a dungeon, he has brought you here. You know not with whomst you speak, nor how many lost souls thou may find fellowship with.
It is a miserable place... but in misery lies hope, the goals of the Dungeon Master - fine mysteries that man hath yet to solve - need not be known at present time.
It is thine right to change the colour of soul, the Dungeon Master would see to it that your urges are sated.
Should you wish to breach the surface and be relieved the veil of shadow, you may consult the Dungeon Master - ever watchful.`

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
const perChannelWebhookNum = 8;

const dungeonCategoryId = '1032563266171457546';
const exemptRoleId = '1032722633118187550';
const ownerId = '372325472811352065';
const ownerChannel = '1032742077332729887';
const memberRoleId = '1032733231205843136';

client.scommands = new Discord.Collection();
const scommandFiles = fs.readdirSync('./slashCommands/').filter(file => file.endsWith('.js'));
for(const sfile of scommandFiles){
    const command = require(`./slashCommands/${sfile}`);

    client.scommands.set(command.name, command);
}

let memberChannels = require('./memberChannels.json');

async function broadcastMsg(msg){
    // console.log(msg.content)
    const guild = client.guilds.cache.first();
    let colour = '';
    const keys = await msg.member.roles.cache.keys()
    if (msg.member.roles.cache.size > 0){
        for (let id of keys){
            colour = colourAv[id];
            if (colour !== '') break;
        }
    }
    if (colour == '' || colour == undefined || colour == null){colour = 'R'}

    Object.entries(allWebhooks).forEach((entry,other) =>{
        const cid = entry[0]
        const col = entry[1]
        if (msg.channelId == cid) return;
        // console.log(cid)
        // console.log(col[colour])
        guild.channels.fetch(cid).then(ch=>{
            ch.fetchWebhooks().then(whs=>{
                whs.get(col[colour]).send({
                    content: msg.content,
                    attachments: msg.attachments,
                    username: 'Creature',
                });
            });
        });
    });
}

async function writeWebhooks(){
    const data = JSON.stringify(allWebhooks,null,4);
    slog('WROTE TO WEBHOOKS');
    fs.writeFile('./webhooks.json',data,(err)=>{
        if (err) console.trace(err);
    });
}

async function writeChannels(){
    const data = JSON.stringify(memberChannels,null,4);
    slog('WROTE TO CHANNELS');
    fs.writeFile('./memberChannels.json',data,(err)=>{
        if (err) console.trace(err);
    });
}

async function slog(str){
    console.log(str);
}

// async function chatSay(id,msgContent){
//     const guild = client.guilds.cache.first();
//     const whs = await guild.channels.cache.get(id).fetchWebhooks();
//     whs.forEach(wh=>{
//         wh.send({
//             content: msgContent,
//             username: 'Voice',
//         });
//     });
// }

async function joinNewMembers(guild){
    guild.members.cache.forEach(async m =>{
        if (!memberChannels.hasOwnProperty(m.user.id) && m.user.id != ownerId && !m.user.bot){
            const dungeon = m.guild.channels.cache.get(dungeonCategoryId);
            let viewperm = Discord.PermissionsBitField.Flags = Discord.PermissionFlagsBits.ViewChannel;
            let newChannel = await dungeon.children.create({
                name:m.user.tag,
                permissionOverwrites:[
                    {
                        id:m.guild.roles.everyone.id,
                        deny: [viewperm]
                    },
                    {
                        id:m.id,
                        allow: [viewperm]
                    }
                ]
            });

            memberChannels[m.id] = newChannel.id;

            let webhooks = await newChannel.fetchWebhooks();
            if(allWebhooks.hasOwnProperty(newChannel.id)) return;
            if(webhooks.size == perChannelWebhookNum && !allWebhooks.hasOwnProperty(newChannel.id)){
                allWebhooks[newChannel.id] = {};
                webhooks.forEach(wh=>{
                    if (wh.name == 'Voice') return;
                    allWebhooks[newChannel.id][wh.name] = wh.id;
                });
                writeWebhooks();
                return;
            }
            if (webhooks.size == 0){
                // slog('DANGER ZONE');
                // return;
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
            } else if (webhooks.size != 0 && webhooks.size < perChannelWebhookNum){
                // slog('DANGER ZONE');
                // return;
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
            await newChannel.createWebhook({
                name: 'Voice',
                avatar: `./avatar.jpg`
            }).then(wh => {
                slog('Spawned a Voice');
                wh.send({
                    content: drearySpeech,
                    username: 'Voice',
                });
            });
            slog('Created new channel for '+m.user.tag);
            setTimeout(()=>{writeChannels()},3000);
        }
    });
}

// VERIFY ALL THE USERS WHO ARE ONLINE AND COPY THAT TO AN ON LEAVE EVENT

client.once(Discord.Events.ClientReady, async client => {
    console.log('DUNGEON MASTER ONLINE');
    const guild = client.guilds.cache.first();
    slog('DONE CATCHUP')
    const channels = guild.channels.cache.filter(c=>(c.type == Discord.ChannelType.GuildText) && (c.parentId == dungeonCategoryId));
    const mcValues = Object.values(memberChannels);
    let counter = 0
    channels.forEach(async c => {
        counter++;
        if (counter == channels.size){setTimeout(()=>{writeWebhooks();writeChannels();},5000)}
        //channels
        if (c.id == ownerChannel) return;
        let members = c.members.filter(m=>(!m.roles.cache.has(exemptRoleId)));
        if (members.size > 0 && !mcValues.includes(c.id)) {
            memberChannels[members.first().user.id]=c.id;
            slog(`Added member ${members.first().user.tag}`);
        } else if (members.size == 0 && mcValues.includes(c.id)) {
            const keys = Object.keys(memberChannels)
            let delCh = c.id;
            for (k in keys){
                if (memberChannels[k] == delCh) {
                    delete memberChannels[k];
                    break;
                }
            }
            slog(`Member ${c.name} left.`);
            c.delete('Member left.');
            delete allWebhooks[delCh];
            return;
        }

        //webhooks
        let webhooks = await c.fetchWebhooks();
        if(allWebhooks.hasOwnProperty(c.id)) return;
        if(webhooks.size == perChannelWebhookNum){
            allWebhooks[c.id] = {};
            webhooks.forEach(wh=>{
                allWebhooks[c.id][wh.name] = wh.id;
            });
            return;
        }
        // return;
        if (webhooks.size == 0){
            // slog('DANGER ZONE');
            // return;
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
        } else if (webhooks.size != 0 && webhooks.size < perChannelWebhookNum){
            // slog('DANGER ZONE');
            // return;
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
        await c.createWebhook({
            name: 'Voice',
            avatar: `./avatar.jpg`
        }).then(wh => {
            slog('Spawned a Voice');
            wh.send({
                content: drearySpeech,
                username: 'Voice',
            });
        });
    });


    await joinNewMembers(guild);

});
client.on(Discord.Events.GuildMemberRemove, async member =>{
    const delCh = memberChannels[member.id];
    member.guild.channels.cache.get(delCh).delete('Member left.');
    delete memberChannels[member.id];
    delete allWebhooks[delCh];
    writeWebhooks();
    writeChannels();
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
    if(webhooks.size == perChannelWebhookNum && !allWebhooks.hasOwnProperty(newChannel.id)){
        allWebhooks[newChannel.id] = {};
        webhooks.forEach(wh=>{
            if (wh.name == 'Voice') return;
            allWebhooks[newChannel.id][wh.name] = wh.id;
        });
        writeWebhooks();
        return;
    }

    memberChannels[member.id] = newChannel.id;

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
    } else if (webhooks.size != 0 && webhooks.size < perChannelWebhookNum){
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
    await newChannel.createWebhook({
        name: 'Voice',
        avatar: `./avatar.jpg`
    }).then(wh => {
        slog('Spawned a Voice');
        wh.send({
            content: drearySpeech,
            username: 'Voice',
        });
    }).catch(console.error);

    setTimeout(()=>{writeChannels()},3000);
    slog('Created new channel for '+member.user.tag);
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