//Launch in terminal with:
//node --env-file=_SECRETS/.env bot.mjs

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

client.on(GatewayDispatchEvents.MessageCreate, async ({api, data}) => {
  if (data.author.bot) {
    return;
  }

  //If a message contains !ping
  if (data.content === '.ping') {
    await api.channels.createMessage(data.channel_id, {
      content: 'pong!',
      message_reference: {message_id: data.id},
    });

    await api.channels.createReaction(
      data.channel_id,
      data.id,
      '👍'
    );
  }
});

//Log in
client.on(GatewayDispatchEvents.Ready, ({data}) => {
  const {username, discriminator} = data.user;
  console.log(`Logged in as @${username}#${discriminator}`);
});

gateway.connect();