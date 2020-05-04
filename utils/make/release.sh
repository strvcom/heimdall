#!/bin/sh

branch="$1"
noclean="$2"

set -o errexit

head=$(git rev-parse --abbrev-ref HEAD)

printf "\n=====>\tCreating release branch: %s...\n" "${branch}"

git checkout -B "${branch}"

printf "\n=====>\tPushing...\n"

git push --set-upstream origin "${branch}"

printf "\n=====>\tSwitching back to previous branch: %s...\n" "${head}"

git checkout "${head}"

if [ "${noclean}" != "noclean" ]; then
  printf "\n=====>\tDeleting local release branch: %s...\n" "${branch}"

  git branch --delete "${branch}"
fi

printf "\n=====>\tRelease in progress: https://github.com/strvcom/heimdall/actions\n"
