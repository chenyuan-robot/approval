#!/bin/bash

/d/software/HbuilderX/HBuilderX.4.87.2025121004/HBuilderX/cli.exe publish --platform h5 --project approval

# RED='\033[0;31m'
# GREEN='\033[0;32m'
# NC='\033[0m'

SHELL_FOLDER=$(cd "$(dirname "$0")";pwd)
PARENT_FOLDER=$(cd $SHELL_FOLDER/..; pwd)
HOME_PATH=$(cd ~;pwd)

# 测试： ./build.sh
# 预发布： ./build.sh pre
# 生产： ./build.sh prod
FLAG_PROD=stage_latest
# BUILD_FLAG=build:stage
# if [[ $1 == prod ]]; then
#     FLAG_PROD=prod_latest
#     BUILD_FLAG=build
# fi

# npm install

MAIN_DIR=$SHELL_FOLDER
MAIN_NAME=web_applet_approval
cd $MAIN_DIR

rm -rf logs
if [[ $? != 0 ]]; then echo -e "${RED}git pull error${NC}"; exit 100; fi

BRANCH_NAME=`git branch | grep "*"`
echo -e "${GREEN}branch: ${BRANCH_NAME/* /}${NC}"

# npm run $BUILD_FLAG
# if [[ $? != 0 ]]; then echo -e "${RED}build error${NC}"; exit 100; fi

DOCKER_FILE=Dockerfile

PLATFORM_ARG=""
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    echo -e "${GREEN}检测到 Apple Silicon (arm64)，将强制构建 linux/amd64 镜像以兼容服务器...${NC}"
    PLATFORM_ARG="--platform linux/amd64"
fi

docker build $PLATFORM_ARG -f $DOCKER_FILE -t $MAIN_NAME $MAIN_DIR
if [[ $? != 0 ]]; then echo -e "${RED}build docker with error for dc_sync${NC}"; exit 100; fi

if [[ $1 == prod ]]; then
    docker tag $MAIN_NAME harbor.cowarobot.cn/softpro/$MAIN_NAME:$FLAG_PROD
    docker push harbor.cowarobot.cn/softpro/$MAIN_NAME:$FLAG_PROD
    docker tag $MAIN_NAME harbor.cowarobot.cn/softpro/$MAIN_NAME:$CI_COMMIT_SHA
    docker push harbor.cowarobot.cn/softpro/$MAIN_NAME:$CI_COMMIT_SHA
else
    docker tag $MAIN_NAME harbor.cowarobot.cn/softrepo/$MAIN_NAME:$FLAG_PROD
    docker push harbor.cowarobot.cn/softrepo/$MAIN_NAME:$FLAG_PROD
fi
