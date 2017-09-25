#!/bin/bash

cd ~/myao

rm package-lock.json

npm i

forever start -l ~/logs/myao.log -a ~/myao/app.js

tail -0f ~/logs/myao.log
