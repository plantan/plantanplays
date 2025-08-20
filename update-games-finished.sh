#!/bin/bash

cd ~/plantanplays
sshpass -p $1 sftp username@ftpserver <<EOF
get PATH_TO_RESOURCE_ON_FTPS_SERVER
bye
EOF
