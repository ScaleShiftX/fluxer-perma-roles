#For updating the EC2 server with the git repo

#Environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" #Change directory to where the script is
SSH_DIR_RELATIVE=_SSH #Next to the script is this folder which contains the SSH .env
set -a
source "$SCRIPT_DIR/$SSH_DIR_RELATIVE/.env"
set +a

COMMANDS='
#Update from the git repo
cd ~/fluxer-perma-roles &&
git pull origin main &&
pm2 restart bot &&

#Read logs
pm2 logs bot --lines 1 --nostream
'

#Check if in SSH session
if [ -n "$SSH_CONNECTION" ]; then
    echo "Already on EC2..."
	eval "$COMMANDS"
else
    echo "Not on EC2 - connecting via SSH..."
    ssh -i "$SCRIPT_DIR/$SSH_DIR_RELATIVE/$KEY" "$REMOTE" "bash -c '$COMMANDS'"
fi