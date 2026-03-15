export default async function applyRole(guild_id, { rest }, ageGroup, user_id) {
    const roleMap = {
        "<13": "1482324436479746391",   //A
        "13-14": "1482324559393837278", //B
        "15-17": "1482324559393837278", //B
        "18-22": "1475512878217941092", //18+
        "23+": "1475512878217941092"    //18+
    };
    const roleId = roleMap[ageGroup];

    //Apply the role
    await rest.put(
        `/guilds/${guild_id}/members/${user_id}/roles/${roleId}`
    );
}