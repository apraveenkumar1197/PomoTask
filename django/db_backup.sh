#!/bin/bash
set -a
source "$(dirname "$0")/.env"
set +a

docker exec -it $MONGO_CONTAINER_ID /bin/mongodump \
  --uri="mongodb://$MONGO_ADMIN_USER:$MONGO_ADMIN_PASSWORD@localhost:27017/?retryWrites=true&loadBalanced=false&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1" \
  --db=$DB_NAME --archive=/pomotask.json

docker cp $MONGO_CONTAINER_ID:/pomotask.json /root/pomotask.json

sendemail -f $BACKUP_EMAIL -t $BACKUP_EMAIL \
  -u "DB Backup - Pomotask" -m "Backup" \
  -s smtp.gmail.com:587 -o tls=yes \
  -xu $BACKUP_EMAIL -xp "$GMAIL_APP_PASSWORD" \
  -a /root/pomotask.json


# Restore
# mongorestore --archive=pomotask.json \
#   --uri="mongodb://$MONGO_ADMIN_USER:$MONGO_ADMIN_PASSWORD@localhost:27017/?retryWrites=true&loadBalanced=false&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1"
