const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken('MTAzMjM2OTI5NzYzODU2MzkzMw.GOZvof.OXvN3AdEab7EeOTHuBmkKlm2CsgGSI7CrqytQg');
const commandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));

async function deployCommands(all,name){
    if (all){
        for (const file of commandFiles) {
            const command = require(`./slashCommands/${file}`);
            commands.push(command.data.toJSON());
        }

        (async () => {
            try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);

                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    Routes.applicationGuildCommands('1032369297638563933', '1032367473011458189'),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                console.error(error);
            }
        })();
    } else {
        if (!commandFiles.includes(`${name}.js`)){
            console.log('Command does not exist');
        }
        let cmd = require(`./shashCommands/${name}.js`).data.toJSON();
        commands.push(cmd);
        (async () => {
            try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);

                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    Routes.applicationGuildCommands('1032369297638563933', '1032367473011458189'),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                console.error(error);
            }
        })();
    }
}

deployCommands(true,null);