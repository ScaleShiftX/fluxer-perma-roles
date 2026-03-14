//Launch in terminal with:
//npx nodemon --env-file=_SECRETS/.env bot.mjs
//(nodemon will relaunch any time there are code changes)

//1. Write a message
//2. Copy message link of that message
//3. Write `.role [message link]`

import {Client, GatewayDispatchEvents} from '@discordjs/core';
import {REST} from '@discordjs/rest';
import {WebSocketManager} from '@discordjs/ws';

const token = process.env['FLUXER_BOT_TOKEN'];
if (!token) {
  throw new Error('You forgot the token!');
}

const rest = new REST({api: 'https://api.fluxer.app', version: '1'}).setToken(token);

const gateway = new WebSocketManager({
  intents: 0,
  rest,
  token,
  version: '1',
});

const client = new Client({rest, gateway});

//When any message is sent in a channel this bot can see
client.on(GatewayDispatchEvents.MessageCreate, async ({api, data}) => {
    //Ignore messages this bot sent
    if (data.author.bot) {
        return;
    }

    //If a message contains !ping
    const role_command = '.role ';
    if (data.content.startsWith(role_command)) {
        //Reply
        await api.channels.createMessage(data.channel_id, {
            content: 'Attempting to add reaction role...',
            message_reference: {message_id: data.id},
        });

        //Slice off the characters of the command name
        const args = data.content.slice(role_command.length + 'https://fluxer.app/channels/'.length).split('/');
        console.log(args);

        try {
            //Add a reaction
            await rest.put(
                `/channels/${args[1]}`
                + `/messages/${args[2]}`
                + `/reactions/${encodeURIComponent('👍')}`
                + `/@me`
            );
        } catch (err) {
            console.error('Reaction failed:', err);
        }
    }
});

//Log in
client.on(GatewayDispatchEvents.Ready, ({data}) => {
  const {username, discriminator} = data.user;
  console.log(`Logged in as @${username}#${discriminator}`);
});

gateway.connect();
















