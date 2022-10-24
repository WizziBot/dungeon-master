const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [ Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.AutoModerationConfiguration, Discord.GatewayIntentBits.AutoModerationExecution, Discord.GatewayIntentBits.GuildPresences ],
    partials: [Discord.Partials.GuildMember, Discord.Partials.User]
});  
const fs = require('fs');

const drearySpeech = `You are in a dungeon, he has brought you here. You know not with whomst you speak, nor how many lost souls thou may find fellowship with.
It is a miserable place... but in misery lies hope, the goals of the Dungeon Master - fine mysteries that man hath yet to solve - need not be known at present time.
It is thine right to change the colour of soul, the Dungeon Master would see to it that your urges are sated.
Should thou wish to breach the surface and be relieved the veil of shadow, you may consult the Dungeon Master - ever watchful.

Type / and all shall become apparent.`;

const colourAv = {
    '1032375800256811018':'R',
    '1032376058936303637':'G',
    '1032376087847632948':'B',
    '1032376123755085925':'P',
    '1032376250888634440':'C',
    '1032376199835566110':'Y',
    '1032376577570394143':'I',
}

const colourRl = {
    '1032375800256811018':'R',
    '1032376058936303637':'G',
    '1032376087847632948':'B',
    '1032376123755085925':'P',
    '1032376250888634440':'C',
    '1032376199835566110':'Y',
    '1032376577570394143':'I',
    '1033424455034228806':'U'
}
const colours = require('./colours.json');
let allWebhooks = require('./webhooks.json');
let memberChannels = require('./memberChannels.json');
const blacklist = require('./blacklist.json');
let memberList = require('./memberList.json');
let config = require('./config.json');
const { waitForDebugger } = require('inspector');
let impersonationMap = {};
const perChannelWebhookNum = 8;

const dungeonCategoryId = '1032563266171457546';
const exemptRoleId = '1032722633118187550';
const ownerId = '432816302424457226';
const ownerChannel = '1032975203573174292';
const memberRoleId = '1032733231205843136';
const deanonId = '1032697010496737360';
const defaultColourId = '1032376058936303637';
const imposterRoleId = '1034139467356852244';
const viewperm = Discord.PermissionFlagsBits.ViewChannel;

client.scommands = new Discord.Collection();
const scommandFiles = fs.readdirSync('./slashCommands/').filter(file => file.endsWith('.js'));
for(const sfile of scommandFiles){
    const command = require(`./slashCommands/${sfile}`);

    client.scommands.set(command.name, command);
}


async function broadcastMsg(msg,isref,refmsg){
    if (blacklist.includes(msg.author.id)) return;
    // Imposter
    let creatureName = 'Creature';
    if (msg.member.roles.cache.has(imposterRoleId)){
        creatureName = impersonationMap[msg.author.id][0];
    }

    // Reply functionality
    let content = '';

    // Inject reply
    if (isref){
        if (refmsg.content == ''){
            content = '> `Attachment`\n';
        } else {
            refmsg.content.split("\n").forEach(l =>{
                content = content + '> '+l+'\n'; 
            });
        }
    }

    content = content + msg.content;

    let attachments = []
    msg.attachments.forEach(at => {
        attachments.push(at.url)
    });
    // console.log(msg.content)
    const guild = client.guilds.cache.first();
    let colour = '';
    const keys = await msg.member.roles.cache.keys()
    if (msg.member.roles.cache.size > 0){
        for (let id of keys){
            colour = colourRl[id];
            if (colour != '' && colour != undefined && colour != null){
                if (colour == 'U'){
                    // CHANGE 7 IF NUM COLOURS CHANGE
                    colour = Object.values(colourRl)[Math.floor(Math.random()*7)];
                }
                break;
            }
        }
    }

    if (colour == '' || colour == undefined || colour == null){colour = 'R';slog('Error fetching colour for member '+msg.author.tag)}

    Object.entries(allWebhooks).forEach((entry,other) =>{
        const cid = entry[0]
        const col = entry[1]
        if (msg.channelId == cid) return;
        // console.log(cid)
        // console.log(col[colour])
        guild.channels.fetch(cid).then(ch=>{
            ch.fetchWebhooks().then(whs=>{
                whs.get(col[colour]).send({
                    content: content,
                    files: attachments,
                    username: creatureName,
                });
            });
        });
    });
}

async function writeChanges(name){
    let data = '';
    let filename = '';
    slog(`WRT:${name}`);
    if (name == 'WH') {
        data = JSON.stringify(memberList,null,4);
        filename = './webhooks.json';
    } else if (name == 'CH') {
        data = JSON.stringify(memberChannels,null,4);
        filename = './memberChannels.json';
    } else if (name == 'MB') {
        data = JSON.stringify(memberList,null,4);
        filename = './memberList.json';
    }
    fs.writeFileSync(filename,data,(err)=>{
        if (err) console.trace(err);
    });
}

async function slog(str){
    console.log(str);
}

async function purgeChannels(){
    const guild = client.guilds.cache.first();
    const channelsMap = guild.channels.cache.filter(c=>(c.type == Discord.ChannelType.GuildText) && (c.parentId == dungeonCategoryId));
    const mcValues = Object.values(memberChannels);
    const channels = Object.values(channelsMap);
    for (let i=0;i<channels.size;i++){
        //channels
        let c = channels.at(i);
        if (c.id == ownerChannel) continue;
        let members = c.members.filter(m=>(!m.roles.cache.has(exemptRoleId) && !m.user.bot));
        if (members.size > 0 && !mcValues.includes(c.id)) {
            memberChannels[members.first().user.id]=c.id;
            slog(`Added member ${members.first().user.tag}`);
        } else if (members.size == 0 && mcValues.includes(c.id)) {
            slog('CHECKING IF MEMBER');
            const keys = Object.keys(memberChannels)
            let delCh = c.id;
            for (let i=0;i<keys.length;i++){
                if (memberChannels[keys[i]] == delCh) {
                    const possibleMember = await guild.members.fetch(keys[i]);
                    if (possibleMember){
                        slog('FOUND OLD MEMBER');
                        c.permissionOverwrites.set([
                            {
                                id:guild.roles.everyone.id,
                                deny: [viewperm]
                            },
                            {
                                id:(possibleMember).id,
                                allow: [viewperm]
                            }
                        ],'Joined member to previous channel.');
                        break;
                    } else{
                        delete memberChannels[k];
                        slog(`Member ${c.name} left.`);
                        c.delete('Member left.');
                        delete allWebhooks[delCh];
                        continue;
                    }
                }
            }
        }
    }
    writeChanges('WH');
    writeChanges('CH');
}

async function joinNewMembers(guild){
    guild.members.cache.forEach(async m =>{
        if (!memberChannels.hasOwnProperty(m.user.id) && m.user.id != ownerId && !m.user.bot){
            slog(`New member ${m.user.tag}`);
            m.roles.add(memberRoleId);
            m.roles.add(defaultColourId);

            memberList.push(member.displayName);
            writeChanges('MB');

            const dungeon = await m.guild.channels.fetch(dungeonCategoryId);
            let c = await dungeon.children.create({
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
            memberChannels[m.id] = c.id;
            writeChanges('CH');

            //Create all the webhooks for the channel
            new Promise(async (resolve,reject)=>{
                // slog('DANGER ZONE');
                // return;
                allWebhooks[c.id] = {};
                let cols = Object.values(colourAv)
                for(let i=0;i<cols.length;i++){
                    let col = cols[i];
                    c.createWebhook({
                        name: col,
                        avatar: `./colour_avatars/${col}.png`
                    }).then(async wh => {
                        slog('Spawned a Creature ' + col);
                        allWebhooks[c.id][col] = wh.id;
                        if (i == cols.length - 1){
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
                            resolve();
                        }
                    }).catch((err)=>reject(err));
                }
            }).then(()=>{writeChanges('WH');writeChanges('CH');}).catch((err)=>console.log(err));
            slog('Created new channel for '+m.user.tag);
        }
    });
}

client.once(Discord.Events.ClientReady, async client => {
    console.log('DUNGEON MASTER ONLINE');
    const guild = client.guilds.cache.first();
    // Remove impersonation role
    const imposter = guild.roles.cache.get(imposterRoleId);
    imposter.members.forEach((member, i) => {
        member.roles.remove(imposterRoleId);
    });
    // Check channels and webhooks
    const channels = guild.channels.cache.filter(c=>(c.type == Discord.ChannelType.GuildText) && (c.parentId == dungeonCategoryId));
    const mcValues = Object.values(memberChannels);
    for (let i=0;i<channels.size;i++){
        let c = channels.at(i);
        //channels
        if (c.id == ownerChannel) continue;
        let members = c.members.filter(m=>(!m.roles.cache.has(exemptRoleId) && !m.user.bot));
        if (members.size > 0){
            const m = members.first();
            if (!memberList.includes(m.displayName)){
                memberList.push(m.displayName);
                writeChanges('MB');
            }
        }
        if (members.size > 0 && !mcValues.includes(c.id)) {
            const m = members.first();
            memberChannels[m.user.id]=c.id;
            writeChanges('CH');
            slog(`Added member ${m.user.tag}`);
        } else if (members.size == 0 && mcValues.includes(c.id)) {
            const keys = Object.keys(memberChannels)
            let delCh = c.id;
            for (let i=0;i<keys.length;i++){
                if (memberChannels[keys[i]] == delCh) {
                    const isPossibleMember = guild.members.resolve(keys[i]);
                    if (isPossibleMember){
                        const possibleMember = await guild.members.fetch(keys[i]);
                        // Break out if its deanon
                        if (possibleMember.roles.resolve(deanonId)) break;
                        slog('Found old member.');
                        possibleMember.roles.add(memberRoleId);
                        possibleMember.roles.add(defaultColourId);
                        c.edit({permissionOverwrites:[
                            {
                                id:guild.roles.everyone.id,
                                deny: [viewperm]
                            },
                            {
                                id:possibleMember.id,
                                allow: [viewperm]
                            }
                        ]});
                        break;
                    }
                }
            }
        }
        // slog('Updated Channels.');
        //webhooks
        let webhooks = await c.fetchWebhooks();
        if(allWebhooks.hasOwnProperty(c.id)) continue;
        if(webhooks.size == perChannelWebhookNum){
            allWebhooks[c.id] = {};
            webhooks.forEach(wh=>{
                if (wh.name == "Voice") return;
                allWebhooks[c.id][wh.name] = wh.id;
            });
            writeChanges('WH');
            continue;
        }
        slog('Awaiting webhooks.');
        // continue;
        await new Promise(async (resolve,reject)=>{
            if (webhooks.size != 0 && webhooks.size < perChannelWebhookNum){
                webhooks.forEach(async w => {w.delete()});
            }
            // slog('DANGER ZONE');
            allWebhooks[c.id] = {};
            let cols = Object.values(colourAv)
            for(let i=0;i<cols.length;i++){
                let col = cols[i];
                c.createWebhook({
                    name: col,
                    avatar: `./colour_avatars/${col}.png`
                }).then(async wh => {
                    slog('Spawned a Creature ' + col);
                    allWebhooks[c.id][col] = wh.id;
                    if (i == cols.length - 1){
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
                        resolve();
                    }
                }).catch((err)=>reject(err));
            }
        }).then(()=>{writeChanges('WH');slog('Updated Webhooks.');}).catch((err)=>console.log(err));
    }
    joinNewMembers(guild);
});
client.on(Discord.Events.GuildMemberRemove, async member =>{
    slog(`Member ${member.user.tag} left.`);
});

client.on(Discord.Events.GuildMemberAdd, async member => {
    //add default roles
    member.roles.add(memberRoleId);
    member.roles.add(defaultColourId);

    slog('Checking if old member.');
    if (memberChannels.hasOwnProperty(member.id)){
        slog('Found old member.');
        let c = await member.guild.channels.fetch(memberChannels[member.id]);
        c.edit({permissionOverwrites:[
            {
                id:member.guild.roles.everyone.id,
                deny: [viewperm]
            },
            {
                id:member.id,
                allow: [viewperm]
            }
        ]});
        return;
    }
    slog(`New member ${member.user.tag}`);
    memberList.push(member.displayName);
    writeChanges('MB');

    const dungeon = await member.guild.channels.fetch(dungeonCategoryId);
    const c = await dungeon.children.create({
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

    memberChannels[member.id] = c.id;
    writeChanges('CH');

    //Create all the webhooks for the channel
    new Promise(async (resolve,reject)=>{
        // slog('DANGER ZONE');
        // return;
        allWebhooks[c.id] = {};
        let cols = Object.values(colourAv)
        for(let i=0;i<cols.length;i++){
            let col = cols[i];
            c.createWebhook({
                name: col,
                avatar: `./colour_avatars/${col}.png`
            }).then(async wh => {
                slog('Spawned a Creature ' + col);
                allWebhooks[c.id][col] = wh.id;
                if (i == cols.length - 1){
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
                    resolve();
                }
            }).catch((err)=>reject(err));
        }
    }).then(()=>{writeChanges('WH');}).catch((err)=>console.log(err));
    slog('Created new channel for '+member.user.tag);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

	const command = client.scommands.get(interaction.commandName);

	if (!command) return;

	try {
        if (interaction.commandName == 'dive') {
            await command.execute(interaction,memberChannels);
        } else if (interaction.commandName == 'colour') {
            await command.execute(interaction,colours);
        } else if (interaction.commandName == 'impersonate') {
            await command.execute(interaction,impersonationMap,memberList,config);
        } else {
            await command.execute(interaction);
        }
	} catch (error) {
		console.trace(error);
		await interaction.reply({ content: 'Unknown Error.', ephemeral: true });
	}
});

client.on('messageCreate', async message => {
    if(message.guild === null || message.author.bot) return;
    if(message.channel.parentId != dungeonCategoryId) return;
    if(message.reference){
        // slog('Hey')
        let ch = (await message.guild.channels.fetch(message.reference.channelId));
        let msg = await ch.messages.fetch(message.reference.messageId);
        broadcastMsg(message,true,msg)
    } else {
        broadcastMsg(message,false,null);
    }
});

client.login('MTAzMjM2OTI5NzYzODU2MzkzMw.GOZvof.OXvN3AdEab7EeOTHuBmkKlm2CsgGSI7CrqytQg');