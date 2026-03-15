//Launch in terminal with:
//npx nodemon --env-file=_SECRETS/.env bot.mjs
//(nodemon will relaunch any time there are code changes)

//Or launch without nodemon with:
//node --env-file=_SECRETS/.env bot.mjs

//1. Write a message
//2. Copy message link of that message
//3. Write `.role [message link]`

//To get stuff like role IDs, you need to be in developer mode and right-click on the server, and select debug community

import {Client, GatewayDispatchEvents} from '@discordjs/core';
import {REST} from '@discordjs/rest';
import {WebSocketManager} from '@discordjs/ws';
import Database from "better-sqlite3";
import dmSetup from './dm_setup.mjs';
import applyRole from './apply_role.mjs';
//import migrateDb from './_SECRETS/db/migrate.mjs';

//Setup
const guild_id = '1475505230441079387'; //ScaleShift's server

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
const db = new Database('./_SECRETS/db/roles.db');
//migrateDb(db);

db.exec(`
    CREATE TABLE IF NOT EXISTS age_verification (
        age_verification_message_id TEXT,
        user_id TEXT NOT NULL PRIMARY KEY,
        age_group_reported TEXT NOT NULL,
        reaction_timestamp INTEGER NOT NULL
    )
`);

//Send a message to users when they join the server
client.on(GatewayDispatchEvents.GuildMemberAdd, async ({ api, data }) => {
    //Apply the user's existing roles if they already exist in the database
    //Find this user ID in our age_verification database
    //(if it does not exist, the user has not yet setup)
    const row = db.prepare(`
        SELECT age_group_reported
        FROM age_verification
        WHERE user_id = ?
        AND age_group_reported IS NOT NULL
        AND age_group_reported != ''
        LIMIT 1
    `).get(data.user.id);

    if (!row) {
        console.log('This user has not yet reported an age; proceeding to prompt them to setup in DMs');

        dmSetup({ api, rest, db }, data.user.id);
    }
    else {
        console.log('This user HAS reported an age previously (probably rejoined); re-adding their perma role(s)');
        console.log("Row found:", row);

        applyRole(guild_id, { rest }, row.age_group_reported, data.user.id);
    }
});

//Listen for reactions to the server message asking you to react to start your set up process
const messageSetup = '1482494874988936574'; //pre-existing message in the server that people can react to
client.on(GatewayDispatchEvents.MessageReactionAdd, async ({ api, data }) => {
    //Only send a DM to someone who has reacted to a valid message
    if (messageSetup === null) {
        return;
    }

    if (data.message_id !== messageSetup) {
        return;
    }

    //Don't react to ourselves
    console.log('data', data);
    if (data.user_id === process.env.FLUXER_BOT_ID) return; //user ID of the bot, stored in _SECRETS/.env

    //DM users who react to the valid message
    dmSetup({ api, rest, db }, data.user_id);
});

//Listen for reactions to the setup DM
client.on(GatewayDispatchEvents.MessageReactionAdd, async ({ data }) => {
    //Don't react to ourselves
    if (data.user_id === process.env.FLUXER_BOT_ID) return; //user ID of the bot, stored in _SECRETS/.env

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

    //Apply the appropriate role
    console.log('Applying role');
    applyRole(guild_id, { rest }, ageGroup, data.user_id);
});

//Remove a user from the database (mostly for diagnostics)
client.on(GatewayDispatchEvents.MessageCreate, async ({api, data}) => {
    //Ignore messages this bot sent
    if (data.author.bot) {
        return;
    }

    //If a message contains the command
    const role_command = '.remove ';
    if (data.content.startsWith(role_command)) {
        //Only allow admins to run this command
        if (author.user_id !== '1475197769988640991') { //ScaleShift's user ID, hardcoded
            await api.channels.createMessage(data.channel_id, {
                content: 'This command is only available to admins.',
                message_reference: {message_id: data.id},
            });

            return;
        }

        //Slice off the characters after the command name
        const userId = data.content.split(role_command.length)[1];

        //Begin
        await api.channels.createMessage(data.channel_id, {
            content: 'Attempting to remove user ID ' + userId + ' from the database...',
            message_reference: {message_id: data.id},
        });

        try {
            //Delete user from table
            const result = db.prepare(`
                DELETE FROM age_verification
                WHERE user_id = ?
            `).run(userId);

            //Success
            if (result.changes >= 1){
                await api.channels.createMessage(data.channel_id, {
                    content: 'SUCCESSFULLY removed ' + userId + ' from the database!',
                    message_reference: {message_id: data.id},
                });
            }
        } catch (error) {
            //Failure
            await api.channels.createMessage(data.channel_id, {
                content: 'FAILED to remove user ID ' + userId + ' from the database!',
                message_reference: {message_id: data.id},
            });
        }
    }
});

//Log in
client.on(GatewayDispatchEvents.Ready, ({data}) => {
    const {username, discriminator} = data.user;
    console.log(`Logged in as @${username}#${discriminator}`);
});

gateway.connect();