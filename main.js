const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [ Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildWebhooks, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.AutoModerationConfiguration, Discord.GatewayIntentBits.AutoModerationExecution ]
});  
const prefix = '-';
const fs = require('fs');

const colours = {
    'red': '1032375800256811018',
    'green': '1032376058936303637',
    'blue': '1032376087847632948',
    'violet': '1032376123755085925',
    'cyan': '1032376250888634440',
    'yellow': '1032376199835566110',
    'indigo': '1032376577570394143',
};

// client.commands = new Discord.Collection();
// const commandFiles = fs.readdirSync('./chatCommands/').filter(file => file.endsWith('.js'));
// for(const file of commandFiles){
//     const command = require(`./chatCommands/${file}`);

//     client.commands.set(command.name, command);
// }
client.scommands = new Discord.Collection();
const scommandFiles = fs.readdirSync('./slashCommands/').filter(file => file.endsWith('.js'));
for(const sfile of scommandFiles){
    const command = require(`./slashCommands/${sfile}`);

    client.scommands.set(command.name, command);
}

client.once('ready',()=>{
    console.log('DUNGEON MASTER ONLINE');
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

// client.on('messageCreate', async message => {
//     if(message.guild === null) return;
//     if(!message.content.startsWith(prefix) || message.author.bot) return;
//     const preargs = message.content.slice(prefix.length).trim().split(' ');
//     const args = preargs.filter(function (el) {
//         return el != '';
//       });
//     const command = args.shift().toLowerCase();
//     const commandArgs = args.join(' ');

//     //credit system commands
//     if(command === 'ping'){
//         if(message.member.roles.cache.has('775067525196283905')){
//             client.commands.get('ping').execute(message, args);
//         }
//     } else if(command === 'colour'){
//         client.commands.get('colour').execute(message, commandArgs, colors);
//     } else if(command === 'colours'){
//         client.commands.get('colours').execute(message, commandArgs, colors);
//     }
// });

client.login('MTAzMjM2OTI5NzYzODU2MzkzMw.GOZvof.OXvN3AdEab7EeOTHuBmkKlm2CsgGSI7CrqytQg');