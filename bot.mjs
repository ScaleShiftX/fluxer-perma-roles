//Launch in terminal with:
//npx nodemon --env-file=_SECRETS/.env bot.mjs
//(nodemon will relaunch any time there are code changes)

//1. Write a message
//2. Copy message link of that message
//3. Write `.role [message link]`

import {Client, GatewayDispatchEvents} from '@discordjs/core';
import {REST} from '@discordjs/rest';
import {WebSocketManager} from '@discordjs/ws';
import Database from "better-sqlite3";

//Setup
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

//Database setup
const db = new Database("roles.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS age_verification (
        age_verification_message_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        age_group_reported TEXT NOT NULL,
        reaction_timestamp INTEGER NOT NULL
    )
`);

//Reactions to the server setup start message
const messageSetup = '1482494874988936574';
client.on(GatewayDispatchEvents.MessageReactionAdd, async ({ api, data }) => {
    if (messageSetup === null) {
        return;
    }

    if (data.message_id !== messageSetup) {
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
`Welcome! Let's get you set up to join ScaleShift's server.
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

        //Insert new DB row, without user selection for now
        db.prepare(`
            INSERT INTO age_verification (
                age_verification_message_id,
                user_id,
                age_group_reported,
                reaction_timestamp
            )
            VALUES (
                ?,
                ?,
                ?,
                ?
            )
        `).run(
            messageAgeVerification.id,
            data.user_id,
            '',
            0,
        );
    } catch (err) {
        console.error(err);
    }
});

//Reactions to individual DMs
client.on(GatewayDispatchEvents.MessageReactionAdd, async ({ data }) => {
    //Find this message ID in our age_verification database
    //(if it does not exist, the message being reacted to isn't an age verification DM we sent out)
    const row = await db.prepare(`
        SELECT *
        FROM age_verification
        WHERE age_verification_message_id = ?
        AND (age_group_reported = '' OR age_group_reported IS NULL)
        LIMIT 1
    `).get(data.message_id);

    if (!row) {
        return;
    }
    else {
        console.log('age_verification row with matching message_id found; proceeding');
    }

    console.log("Row found:", row);

    //Prevent sending multiple reactions, so users can't change their minds without admin approval
    //(For age verification, underage users might decide they want to lie later to access 18+ content)
    if (row.age_group_reported !== ''){
        console.log('age_group_reported is not blank; returning');
        return;
    }
    else {
        console.log('age_group_reported is blank; proceeding');
    }

    //Insert into DB
    console.log('Inserting into DB from message_id ' + data.message_id);

    //Map emoji → age group
    const ageMap = {
        "1️⃣": "<13",
        "2️⃣": "13-14",
        "3️⃣": "15-17",
        "4️⃣": "18-22",
        "5️⃣": "23+"
    };

    const ageGroup = ageMap[data.emoji.name];
    if (!ageGroup) {
        console.log('Error parsing ageGroup from reaction');
        return;
    }

    //Update database row with user-reported age and the time it is reported
    db.prepare(`
        UPDATE age_verification
        SET age_group_reported = ?,
        reaction_timestamp = ?
        WHERE age_verification_message_id = ?
    `).run(
        ageGroup,
        Date.now(),
        data.message_id
    );

    console.log('Updated DB');
});

//Log in
client.on(GatewayDispatchEvents.Ready, ({data}) => {
    const {username, discriminator} = data.user;
    console.log(`Logged in as @${username}#${discriminator}`);
});

gateway.connect();