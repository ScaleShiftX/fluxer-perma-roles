export default async function applyRole(guild_id, { rest }, ageGroup, user_id) {
    const roleMap = {
        "<13": "1482324436479746391",   //A
        "13-14": "1482324559393837278", //B
        "15-17": "1482324559393837278", //B
        "18-22": "1475512878217941092", //18+
        "23+": "1475512878217941092"    //18+
    };
    const roleId = roleMap[ageGroup];

    //Check that they're actually in the server
    const userLocationInServer = `/guilds/${guild_id}/members/${user_id}`;
    try {
        await rest.get(userLocationInServer);
    } catch {
        console.log('User not in guild, skipping role');
        return;
    }

    //Apply the role
    await rest.put(userLocationInServer + `/roles/${roleId}`);

    console.log(`Applied role ${roleId}`);
    //const role = await rest.get(`/guilds/${guild_id}/roles/${roleId}`);
    const rolesAll = await rest.get(`/guilds/${guild_id}/roles`);
    //console.log("All roles in this guild:\n", JSON.stringify(rolesAll, null, 2));
    
    const roleApplied = rolesAll.find(role => role.id === roleId);
    if (roleApplied) {
        console.log(`Applied role: ${roleApplied.name} (${roleApplied.id})`);
    } else {
        console.log(`Applied role ID ${roleId}, but couldn't find name`);
    }

    //https://docs.fluxer.app/api-reference/guilds/list-guild-roles?playground=open
}