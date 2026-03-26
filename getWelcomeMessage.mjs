export default function getWelcomeMessage(userId) {
    //Pick a random welcome message

    const username = `<@${userId}>`;

    const welcomeMessages = [
        `Welcome, ${username}, to the server of furry fluffs and everyone in between!`,
        `You're here, ${username}! And the world is yours to keep weird!`,
        `Greetings, ${username}! We hope you had a good day at school! 🍭`,
        `${username}! Woof, woof! Bark, bark!`,
        `Henlos, ${username}! And welcomes!`,
        `I smell a ${username}! They smell like they must be a nice creature!`,
        `Hmmm, is that a ${username} I see? Helloo!!!!.`,
        `YOOOOOOOOOOOO! ${username}! LET'S GOOOOOOOOO!`,
        `Wassup ${username}?! Welcome! We hope you enjoy your stay!`,
        `${username} just joined! It's good to have you with us :)`,
        `${username} has got the magic in them! Welcome :)`,
        `What's better than money? ${username}! And they just joined!`,
        `Hi ${username}! Welcome to the server!`,
        `Hey, ${username}! Stay awhile and make yourself at home!`,
        `It is our pleasure to receive you, ${username}. The server is made brighter by your presence.`,
        `Yip! Yip! It's ${username}!`,
        `Well, well, well... Look what the cat dragged in... It's ${username}! Hi! :P`,
        `Salut ${username} ! Bienvenue. Comment ça va ?`,
        `Welcome ${username}! You are what you do!`,
        `And on this day, ${username} was brought into the server. And it was good.`,
        `A wild ${username} appeared!`,
        `Oh! ${username}! *Tail wags*`,
        `Ah, splendid! ${username}! Welcome, innit! Kettle's on ☕`
    ];

    return welcomeMessages[
        Math.floor(Math.random() * welcomeMessages.length)
    ];
}