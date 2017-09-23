#!/bin/bash

forever start -l ~/logs/myao.log -a ~/myao/app.js

tail -0f ~/logs/myao.log
