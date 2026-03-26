export default async function dmSetup({ api, rest, db }, user_id) {
    //DM the reacting user
    try {
        //console.log('dmSetup is now trying to get the DM channel ID');

        //Get DM channel
        const dm = await rest.post('/users/@me/channels', {
            body: { recipient_id: user_id },
        });

        //Send DM
        const messageAgeVerification = await api.channels.createMessage(dm.id, { content:
`Welcome! Let's get you set up to join ScaleShift's server.
\nPlease select your age by selecting the corresponding reaction below.
1️⃣ <13
2️⃣ 13-14
3️⃣ 15-17
4️⃣ 18-22
5️⃣ 23+
\nNote that you CANNOT change this later so be honest!

This is just for a server role, and note that we are NOT asking you to provide any form of ID (and we never will) nor are we asking for your exact age. We highly value privacy here.

If you have any problems with the bot, please DM ScaleShift directly!`,
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

        console.log(`DM sent and reactions added. Channel ID: ${messageAgeVerification.channel_id}. Message ID: ${messageAgeVerification.id}`);

        //Insert new DB row, without user selection for now
        //user_id is a PRIMARY KEY so each user can only exist once
        //So if the user already exists, we can't do a simple INSERT
        //Or we will crash
        //As well, we have to keep in mind that we want roles to be perma
        //So if the user has an age_group_reported, we should not overwrite

        //Does the user already have an age_group_reported?
        const existing = db.prepare(`
            SELECT age_group_reported
            FROM age_verification
            WHERE user_id = ?
        `).get(user_id);

        if (!existing) {
            //No row; insert fresh
            db.prepare(`
                INSERT OR REPLACE INTO age_verification (
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
                user_id,
                '',
                0,
            );
        }
        else if (existing.age_group_reported === '') {
            //User exists but no age_group_reported (blank); update message ID
            db.prepare(`
                UPDATE age_verification
                SET age_verification_message_id = ?
                WHERE user_id = ?
            `).run(
                messageAgeVerification.id,
                user_id
            );
        }
        else {
            //User already verified
            console.log('User already verified; skipping DB insert');
            api.channels.createMessage(dm.id, { content:
                `You have already set your age group!`,
            });
        }

        //db.prepare(`
        //    INSERT OR REPLACE INTO age_verification (
        //        age_verification_message_id,
        //        user_id,
        //        age_group_reported,
        //        reaction_timestamp
        //    )
        //    VALUES (
        //        ?,
        //        ?,
        //        ?,
        //        ?
        //    )
        //`).run(
        //    messageAgeVerification.id,
        //    user_id,
        //    '',
        //    0,
        //);
    } catch (err) {
        console.error(err);
    }
}