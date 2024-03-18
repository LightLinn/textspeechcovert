#!/bin/bash

DATE=$(date +%Y-%m-%d)

RANDOM_NUM=$(($RANDOM % 1000))

COMMIT_MESSAGE="Commit on $DATE$RANDOM_NUM"

git add .
git commit -m "$COMMIT_MESSAGE"
git push
