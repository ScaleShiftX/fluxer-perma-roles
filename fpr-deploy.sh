#For updating the EC2 server with the git repo

COMMANDS='
#Update from the git repo
cd ~/fluxer-perma-roles &&
git pull origin main &&
pm2 restart bot &&

#Read logs
pm2 logs bot --lines 8 --nostream
'

#Check if in SSH session
if [ -n "$SSH_CONNECTION" ]; then
    echo "Already on EC2..."
	eval "$COMMANDS"
else
    echo "Not on EC2 - connecting via SSH..."
    ssh ec2 "bash -c '$COMMANDS'"
fi