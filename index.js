const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, youtube_api } = require('./config.json');
const { OWNERID, STATUSID, QUOTEID, VOICECHANNELID, statusList, contentList, typeList } = require('./constant.json');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

var search = require('youtube-search');

var opts = {
    maxResults: 5,
    key: youtube_api,
    type: 'video'
};

let lastCmdSentTime = {};
let waitTimeForUser =  60000 * 30; //Users can only run a command once every 30 minutes
let botLastSent = false;
let timeBetweenEachCmd = 0; 

let msgChannel = client.channels.cache.get('774858295541891082');
let watchChannel = false;
let watchDelete = true;


// keeps the bot awake
require("http").createServer(async (req,res) => { res.statusCode = 200; res.write("ok"); res.end(); }).listen(3000, () => console.log("Now listening on port 3000"));

client.on('message', message => {

    if (watchChannel) {
        let toggle = true;
        try {
            //if (message.channel.id !== msgChannel.id || message.author.id === client.users.cache.get(user => user.name === 'jayBot').id) return;
            if (message.channel.id !== msgChannel.id) toggle = false;
        } catch (err) {
            
        }
        if (toggle) {
            let wChannel = client.channels.cache.find(channel => channel.name === 'msg-as-bot');
            wChannel.send(`${message.author.displayName}: ${message.content}`);
            try {
                if (message.attachments.first().proxyURL !== null) {
                    setTimeout(() => {
                        wChannel.send(message.attachments.first().proxyURL);
                    }, 100);
                }
            } catch (err) {
                //console.log("No attachment/Error with the attatchment");
            }
        }
        
    }

    // Moderates the Karuta bot messages; deletes it when user does a Karuta command not in #commands
    if (message.author.bot) {
        // console.log("Bot id: " + message.author.id);
        // try {
        //     console.log("Find bot id: " + client.users.cache.find(user => user.username === 'Karuta').id);
        // } catch (err) {
        //     console.log("Cache not found");
        // }
        //console.log("KARUTAID: " + KARUTAID);
        //console.log("Channel id: " + message.channel.id);
        //console.log("Find channel id: " + message.guild.channels.cache.find(channel => channel.name === 'commands').id);
        try {
            if (message.author.id === client.users.cache.find(user => user.username === 'Karuta').id && message.channel.id !== message.guild.channels.cache.find(channel => channel.name === 'commands').id) {
                message.delete( {timeout: 1} );
                const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'thonk');
                    message.react(reactionEmoji)
                        .then(console.log)
                        .catch(console.error);
            } else if (message.author.id === client.users.cache.find(user => user.username === 'Karuta').id && message.content.includes("I'm dropping 3 cards since this server is currently active!")) {
                message.channel.send("Karuta has dropped cards @PingMe");
            }
        } catch (err) {
            console.log("Bot cache not found");
        }
        return;
    }

    if (message.channel.type === 'dm') {
        //console.log(message.author.username + ": " + message.content);
        //console.log(message.attachments.proxyURL);
        client.users.cache.get(OWNERID).send(message.author.username + ": " + message.content);
        try {
            if (message.attachments.first().proxyURL !== null) {
                setTimeout(() => {
                    client.users.cache.get(OWNERID).send(message.attachments.first().proxyURL);
                }, 100);
            }
        } catch (err) {
            console.log("No attachment");
        }
        return;
    }

    let isBotOwner = message.author.id === OWNERID;

    if (!message.content.startsWith(prefix)) {
        if (message.content.toLowerCase() === 'kd' || message.content.toLowerCase() === 'k!d' || message.content.toLowerCase() === 'kdrop' || message.content.toLowerCase() === 'k!drop') {
            
            if (message.channel.id !== message.guild.channels.cache.find(channel => channel.name === "commands").id) {
                console.log("Channel id not matching");
                return;
            }

            if (botLastSent) {
                if (message.createdTimestamp - botLastSent < timeBetweenEachCmd) {
                    // console.log("timeBetweenEachCmd: " + timeBetweenEachCmd);
                    // console.log("botLastSent: " + botLastSent);
                    return;
                }
            } 

            let userLastSent = lastCmdSentTime[message.author.id] || false;

            if (userLastSent) {
                if (message.createdTimestamp - userLastSent < waitTimeForUser) {
                    // console.log("timeBetweenEachCmd: " + waitTimeForUser);
                    // console.log("userLastSent: " + userLastSent);
                    // console.log("message.createdTimestamp - userLastSent: " + (message.createdTimestamp - userLastSent));
                    const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'thonk');
                    message.react(reactionEmoji)
                        .then(console.log)
                        .catch(console.error);
                    message.channel.send("You have an ongoing timer!\nThe timer says you will be pinged in `" + (Math.round(((waitTimeForUser - (message.createdTimestamp - userLastSent)) / 60000) * 100) / 100) + " minutes` <@" + message.author.id + ">");
                    return;
                }
            }

            lastCmdSentTime[message.author.id] = message.createdTimestamp;
            botLastSent = message.createdTimestamp;

            const taggedUser = message.author.id;
        
            message.channel.send("You will be pinged in `30 minutes` <@" + taggedUser + ">");

            setTimeout(() => {
                message.channel.send("You can drop again <@" + taggedUser + ">");
            }, 1800000);
            return;
        } else if (message.content.toLowerCase().includes('waffle')) {
            //const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'waffle');
            return message.react('🧇');
        } else if (message.content.toLowerCase().includes('clown') || message.content.toLowerCase().includes('stupid') || message.content.toLowerCase().includes('retard') || message.content.toLowerCase().includes('idiot')) {
            return message.react('🤡');
        } else if (message.content.toLowerCase().includes('bruh')) {
            const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'vincent');
            return message.react(reactionEmoji);
        } else if (message.content.toLowerCase().includes('jedi')) {
            const reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'jedismilepng');
            return message.react(reactionEmoji);
        } else if (message.content.toLowerCase().includes('juan')) {
            const reactionEmoji = message.guild.emoji.cache.find(emoji => emoji.name === 'juaninterview');
            return message.react(reactionEmoji);
        } else if (message.content.toLowerCase().includes('alonzo')) {
            const reactionEmoji = message.guild.emoji.cache.find(emoji => emoji.name === 'alonzothug');
            return message.react(reactionEmoji);
        } else {
            return;
        }
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!(message.channel.id === message.guild.channels.cache.find(channel => channel.name === "commands").id || message.channel.id === message.guild.channels.cache.find(channel => channel.name === "jay-commands").id)) {
        if (!isBotOwner) {
            return message.reply('that command can only be used in <#' + message.guild.channels.cache.find(channel => channel.name === "commands").id + '> or <#' + message.guild.channels.cache.find(channel => channel.name === "jay-commands").id + '>');
        }
    }

    const voiceChannel = client.channels.cache.get(VOICECHANNELID);

    if (commandName === 'dm') {
        if (!isBotOwner) return;
        const user = client.users.cache.get(args[0]);
        var content = "";
        for (var i = 1; i < args.length; i++) {
            content += args[i];
            if (i + 1 < args.length) {
                content += " ";
            }
        }
        try {
            user.send(content);
        } catch (err) {
            console.log("Error trying to send a message");
            console.log(err);
        }
        return;
    } else if (commandName === 'cache') {
        if (!isBotOwner) return;
        if (args[0] === 'users') {
            console.log("User cache:\n");
            console.log(client.users.cache.array());
        } else if (args[0] === 'channels') {
            console.log("Channel cache:\n");
            try {
                console.log(client.channels.cache.findKey(channel => channel.name === args[1]));
            } catch (err) {
                console.log(err);
            }
        } else if (args[0] === 'karuta') {
            console.log("Karuta ID cache:\n");
            try {
                console.log(client.users.cache.find(user => user.username === 'Karuta').id);
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log("Arg needed");
        }
        return;
    } else if (commandName === 'msg') {
        if (!isBotOwner) return;
        let channel;
        try {
            channel = message.guild.channels.cache.find(channel => channel.name === args[0]);
        } catch (err) {
            return message.channel.send("You did not provide a valid channel name");
        }
        msgChannel = channel;
        console.log("channel: " + channel.id);
        console.log("msgChannel: " + msgChannel.id);
        var message = "";
        for (var i = 1; i < args.length; i++) {
            message += args[i];
            message += " ";
        }
        return channel.send(message);
    } else if (commandName === 'd') {
        if (!isBotOwner) return;
        let embed = new Discord.MessageEmbed()
            .setTitle(getCurrentTime())
            .setDescription('Shutting down...')
            .setColor('RED');

            client.channels.cache.get(STATUSID).send(embed).then(m => {
            client.destroy();
            return console.log("You may close this window");
        });
    } else if (commandName === 'playyt') {
        voiceChannel.join().then(connection => {
            const stream = ytdl(args[0], { filter: 'audioonly' });
            const dispatcher = connection.play(stream);
            
            dispatcher.on('finish', () => voiceChannel.leave());
        });
    } else if (commandName === 'join') {
        voiceChannel.join();
        console.log('Bot joined the vc');
    } else if (commandName === 'leave') {
        voiceChannel.leave();
        console.log('Bot left the vc');
    } else if (commandName === 'testtest') {
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play('F:/osu!/Songs/1276213 Eve - Kaikai Kitan (TV Size)/audio.mp3', { volume: 1, bitrate: 96 });

            dispatcher.on('finish', () => voiceChannel.leave());
        });
    } else if (commandName === 'playmp3') {
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play(message.attachments.first().proxyURL);

            dispatcher.on('finish', () => voiceChannel.leave());
        })
    } else if (commandName === 'clear') {
        if (!isBotOwner) return;
        message.channel.bulkDelete(args[0]);
    } else if (commandName === 'botstatus') {
        if (!isBotOwner) return;
        // let newStatus = statusList[args[0]];
        // let newType = typeList[args[1]];
        let newContent = "";
        for (var i = 2; i < args.length; i++) {
            newContent += args[i];
            if (i + 1 < args.length) {
                newContent += " ";
            }
        }
        client.user.setPresence({
            status: args[0],
            activity: {
                name: newContent,
                type: args[1].toUpperCase(),
            }
        });
    } else if (commandName === 'wc') {
        if (!isBotOwner) return;
        watchChannel = !watchChannel;
        console.log("watchChannel: " + watchChannel);
        console.log("msgChannel: " + msgChannel);
    } else if (commandName === 'wd') {
        if (!isBotOwner) return;
        watchDelete = !watchDelete;
        console.log("watchDelet: " + watchDelete);
    }

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.adminOnly && !isBotOwner) {
        return message.channel.send("You are not the owner of the bot!");
    }

    if (!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more seconds(s) before reusing the \`${command.name}\` command.`);
        }
    }

    try {
	    command.execute(message, args);
    } catch (error) {
	    console.error(error);
	    message.reply('There was an error trying to execute that command!');
    }

});

// client.on('message', () => {
//     //if (Math.random() < 0.98) return;
//     let newStatus = statusList[Math.floor(Math.random() * statusList.length)];
//     let newContent = contentList[Math.floor(Math.random() * contentList.length)];
//     let newType = typeList[Math.floor(Math.random() * typeList.length)];

//     client.user.setPresence({
//         status: newStatus,
//         activity: {
//             name: newContent,
//             type: newType,
//         }
//     });
// })

client.on('voiceStateUpdate', (oldState, newState) => {
    let vcLog = client.channels.cache.find(channel => channel.name === "vc-log");
    let status = " ";
    // console.log(newState.channelID);
    // console.log(client.channels.cache.find(channel => channel.name === "high-iq-discussion"));
    if (oldState.channelID === newState.channelID) {
        if (oldState.serverDeaf !== newState.serverDeaf) {
            if (newState.serverDeaf) {
                status = 'server deafened';
            } else {
                status = 'server undeafened';
            }
        } else if (oldState.serverMute !== newState.serverMute) {
            if (newState.serverMute) {
                status = 'server muted';
            } else {
                status = 'server unmuted';
            }
        } else if (oldState.selfDeaf !== newState.selfDeaf) {
            if (newState.selfDeaf) {
                status = 'deafened';
            } else {
                status = 'undeafened';
            }
        } else if (oldState.selfMute !== newState.selfMute) {
            if (newState.selfMute) {
                status = 'muted';
            } else {
                status = 'unmuted';
            }
        } else if (oldState.selfVideo !== newState.selfVideo) {
            if (newState.selfVideo) {
                status = 'turned on their camera';
            } else {
                status = 'turned off their camera';
            }
        } 
        if (status !== " ") {
            return vcLog.send(`\`${newState.member.displayName}\` has \`${status}\` in \`#${newState.channel.name}\` at \`${new Date().toLocaleTimeString()}\``);
        } else {
            return;
        }
    } 
    if (newState.channelID === client.channels.cache.find(channel => channel.name === "high-iq-discussion").id) {
        status = 'joined\` \`#high-iq-discussion';
    } else if (newState.channelID === client.channels.cache.find(channel => channel.name === "yeah").id) {
        status = 'joined\` \`#yeah';
    } else {
        status = `left\` \`#${oldState.channel.name}`;
    }
    vcLog.send(`\`${newState.member.displayName}\` has \`${status}\` at \`${new Date().toLocaleTimeString()}\``);
});

// this does not get emitted if the message deleted is the author of the message
client.on('messageDelete', (messageDelete) => {
    if (!watchDelete) return;
    let mdLog = client.channels.cache.find(channel => channel.name === 'del_msg-log');
    mdLog.send(`\`${messageDelete.author.username}\` deleted a message in \`#${messageDelete.channel.name}\`at \`${new Date().toLocaleTimeString()}\``);
    //mdLog.send("Somebody deleted a message");
});

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.on('ready', () => {

    console.log(getCurrentTime() + 'The bot is ready');

    let embed = new Discord.MessageEmbed()
        .setTitle(getCurrentTime())
        .setDescription('The bot is up and running!')
        .setColor('GREEN');

    client.channels.cache.find(channel => channel.name === "jaybot-status").send(embed);

    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'you | DM me, I will respond back :\)',
            type: 'WATCHING',
        }
    });
});

function getCurrentTime(){
    return new Date().toLocaleTimeString() + ": ";
}

function getCurrentDate(){
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let year = new Date().getFullYear();
    return month + '/' + day + '/' + year;
}

// login to Discord with your app's token
client.login(token);

// this is a test