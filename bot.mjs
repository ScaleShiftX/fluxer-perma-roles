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

        ////Slice off the characters of the command name
        //const args = data.content.slice(role_command.length + 'https://fluxer.app/channels/'.length).split('/');
        //console.log(args);

        //DM the user
        try {
            //Get DM channel
            const dm = await rest.post('/users/@me/channels', {
                body: { recipient_id: data.author.id },
            });

            //Send message to that DM
            await api.channels.createMessage(dm.id, {
                content: `Got your command!`,
            });

            ////Send message to a specific channel
            //const channelID = '1482323208798560606';
            //messageID = await api.channels.createMessage(channelID, {
            //    content: `Welcome to ScaleShift's community server for silly furry fluffs and everyone in between! Come hangout with us, make friends, game together, and get notifs on my videos and livestreams :)
            //    \nBefore you can access the server, we have a brief setup process. React to this message to get started.
            //    \nIf you have any trouble, please DM <@1475197769988640991> directly - he's nice!`,
            //});
        } catch (err) {
            console.error('DM failed:', err);
        }

        //try {
        //    //Add a reaction
        //    await rest.put(
        //        `/channels/${args[1]}`
        //        + `/messages/${args[2]}`
        //        + `/reactions/${encodeURIComponent('👍')}`
        //        + `/@me`
        //    );
        //} catch (err) {
        //    console.error('Reaction failed:', err);
        //}
    }
});

//Reactions to the server setup start message
const messageID = '1482494874988936574';
client.on(GatewayDispatchEvents.MessageReactionAdd, async ({ api, data }) => {
    if (messageID === null) {
        return;
    }

    if (data.message_id !== messageID) {
        return;
    }

    //DM the reacting user
    try {
        //Get DM channel
        const dm = await rest.post('/users/@me/channels', {
            body: { recipient_id: data.user_id },
        });

        //Send DM
        const messageAgeVerification = await api.channels.createMessage(dm.id, { content:
`Welcome!
\nPlease select your age by selecting the corresponding reaction below.
1️⃣<13
2️⃣ 13-14
3️⃣ 15-17
4️⃣ 18-22
5️⃣ 23+
\nNote that you CANNOT change this later so be honest!`,
        });

        //React to own message
        try {
            await rest.put(
                `/channels/${messageAgeVerification.channel_id}`
                + `/messages/${messageAgeVerification.id}`
                + `/reactions/${encodeURIComponent('1️⃣')}`
                + `/@me`
            );

            await rest.put(
                `/channels/${messageAgeVerification.channel_id}`
                + `/messages/${messageAgeVerification.id}`
                + `/reactions/${encodeURIComponent('2️⃣')}`
                + `/@me`
            );

            await rest.put(
                `/channels/${messageAgeVerification.channel_id}`
                + `/messages/${messageAgeVerification.id}`
                + `/reactions/${encodeURIComponent('3️⃣')}`
                + `/@me`
            );

            await rest.put(
                `/channels/${messageAgeVerification.channel_id}`
                + `/messages/${messageAgeVerification.id}`
                + `/reactions/${encodeURIComponent('4️⃣')}`
                + `/@me`
            );

            await rest.put(
                `/channels/${messageAgeVerification.channel_id}`
                + `/messages/${messageAgeVerification.id}`
                + `/reactions/${encodeURIComponent('5️⃣')}`
                + `/@me`
            );
        } catch (err) {
            console.error('Reaction failed:', err);
        }
    } catch (err) {
        console.error(err);
    }

});

//Reactions to individual DMs


//Log in
client.on(GatewayDispatchEvents.Ready, ({data}) => {
  const {username, discriminator} = data.user;
  console.log(`Logged in as @${username}#${discriminator}`);
});

gateway.connect();
















