export default async function dmSetup({ api, rest, db }, user_id) {
    //DM the reacting user
    try {
        console.log('dmSetup is now trying to get the DM channel ID');

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
            user_id,
            '',
            0,
        );
    } catch (err) {
        console.error(err);
    }
}