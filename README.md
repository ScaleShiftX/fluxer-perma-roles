Fluxer Roles which remain attached to users even after leaving and rejoining the server. Highly useful for moderation.

# How to Clone
You will need to do some setup if you want to clone this bot. Fluxer has a basic tutorial here:
https://docs.fluxer.app/quickstart

You can invite the bot to your server with the URL in authorize_url.txt

You will also have to populate the .env with FLUXER_BOT_TOKEN and FLUXER_BOT_ID

For hosting, I recommend a very cheap/free tier of AWS EC2

# Commands
`.remove [userId]`  
Removes that user from the database  
Available only to admins (hardcoded to just ScaleShift for now)

No other commands exist at the moment. I set the reaction message for my server manually and hardcoded its message ID.

# Updates
If you add any updates to the code, you can update the server with `fpr-deploy.sh`. Just make sure you've defined your server in your `.ssh/config`. For obvious security reasons I can't put my exact config in this repo so you'll have to define yours manually, but it should look something like this:
```
[Your home folder (ex: /c/Users/scale)]/.ssh
├── [SSH private key file]
└── config (a text file without a file type)
```

And `config` might have something like this inside:
```
Host ec2
    HostName [server ip]
    User ec2-user
    IdentityFile ~/.ssh/[SSH private key file]
```

# Licence
This repo is licensed with AGPL3.0, a copyleft license.  
This licence ensures that this remains open source regardless of modifications or through being provided via a SaaS.  
Additionally, the software is provided "as is" with no warranty, and the authors or contributors are not liable for any damages arising from its use.  
All details are in the LICENSE file.