const { REST, Routes } = require('discord.js');
const fs = require('fs');

const rest = new REST({ version: '10' }).setToken('MTAzMjM2OTI5NzYzODU2MzkzMw.GOZvof.OXvN3AdEab7EeOTHuBmkKlm2CsgGSI7CrqytQg');


(async () => {
	try {
		rest.get(Routes.applicationGuildCommands('1032369297638563933', '1032367473011458189'))
            .then(data => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationGuildCommands('1032369297638563933', '1032367473011458189')}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                console.log(`Successfully deleted ${data.length} application (/) commands.`);
                return Promise.all(promises);
            });
	} catch (error) {
		console.error(error);
	}
})();