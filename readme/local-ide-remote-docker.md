# Deploy

1. [Setup dropbox on remote machine](https://training.shoppinpal.com/setup-box-on-azure/setup-dropbox-on-azure.html)
1. Please note that in the following instructions, we will use `LMS` as an acronym for `loopback-mongo-sandbox`
1. On remote, setup the following env variables:

    ```
    # edit and replace any env variable's value, based on your needs
    # or feel free to use the defaults
    # if a dir specified as a value doesn't exist then create it before setting the env variables
    export MASTER_DEV_HOME=`echo ~/dev`
    export SYNC_DEV_HOME=`echo ~/Dropbox/remote-dev`
    export LMS_PROJECT_NAME=loopback-mongo-sandbox
    export LMS_SYNC_DIR_NAME=`echo $LMS_PROJECT_NAME.sync`
    export LMS_HOME=`echo $MASTER_DEV_HOME/$LMS_PROJECT_NAME`

    # spit out and confirm the values for all of the following before proceeding
    echo MASTER_DEV_HOME=$MASTER_DEV_HOME && \
      echo LMS_PROJECT_NAME=$LMS_PROJECT_NAME && \
      echo MASTER_DEV_HOME + LMS_PROJECT_NAME = LMS_HOME = $LMS_HOME && \
      echo SYNC_DEV_HOME=$SYNC_DEV_HOME && \
      echo LMS_SYNC_DIR_NAME=$LMS_SYNC_DIR_NAME && \
      echo SYNC_DEV_HOME + LMS_SYNC_DIR_NAME = $SYNC_DEV_HOME/$LMS_SYNC_DIR_NAME
    ```
    * Optionally, you can create and save a `setenv_master.sh` file for reuse in future sessions but do not commit it:

        ```
        #!/bin/sh

        echo "###"
        echo Its best to invoke this script as: '. ./setenv_master.sh' rather than './setenv_master.sh'
        echo "###"

        export MASTER_DEV_HOME=`echo ~/dev` && \
            export SYNC_DEV_HOME=`echo ~/Dropbox/remote-dev` && \
            export LMS_PROJECT_NAME=loopback-mongo-sandbox && \
            export LMS_SYNC_DIR_NAME=`echo $LMS_PROJECT_NAME.sync` && \
            export LMS_HOME=`echo $MASTER_DEV_HOME/$LMS_PROJECT_NAME` && \
        echo MASTER_DEV_HOME=$MASTER_DEV_HOME && \
            echo LMS_PROJECT_NAME=$LMS_PROJECT_NAME && \
            echo MASTER_DEV_HOME + LMS_PROJECT_NAME = LMS_HOME = $LMS_HOME && \
            echo SYNC_DEV_HOME=$SYNC_DEV_HOME && \
            echo LMS_SYNC_DIR_NAME=$LMS_SYNC_DIR_NAME && \
            echo SYNC_DEV_HOME + LMS_SYNC_DIR_NAME = $SYNC_DEV_HOME/$LMS_SYNC_DIR_NAME
        ```
1. On remote, clone the repo

    ```
    cd $MASTER_DEV_HOME && \
      git clone git@github.com:ShoppinPal/loopback-mongo-sandbox.git $LMS_PROJECT_NAME && \
      cd $LMS_HOME
    ```
1. On remote, before making our project sync-capable, let us add rules to prevent unnecessary stuff from syncing:

    ```
    # make sure this is setup by printing it out
    echo LMS_SYNC_DIR_NAME=$LMS_SYNC_DIR_NAME

    # run this as-is
    dropbox exclude add $SYNC_DEV_HOME/$LMS_SYNC_DIR_NAME/.git && \
      dropbox exclude add $SYNC_DEV_HOME/$LMS_SYNC_DIR_NAME/node_modules
    ```
1. On remote, check if they are now excluded, use `dropbox exclude list | grep remote-dev`
    * if an incorrect path was excluded, you can fix it with: `dropbox exclude remove /the/path`
    * for example, if you decide to sync the `.git` folder over to your local then un-exclude it with: `dropbox exclude remove $SYNC_DEV_HOME/$LMS_SYNC_DIR_NAME/.git`
1. On remote, wire up your project root to be synced via Dropbox:
    * go to your LMS_HOME: `cd $LMS_HOME`
    * then run the following command:

        ```
        # make sure this is setup by printing it out
        echo LMS_SYNC_DIR_NAME=$LMS_SYNC_DIR_NAME

        # make sure this is setup by printing it out
        echo LMS_HOME=$LMS_HOME

        # then, run as-is
        cd $LMS_HOME && \
          ln -s `pwd` ~/Dropbox/remote-dev/$LMS_SYNC_DIR_NAME
        ```
    * make sure it worked: `ls -alrt ~/Dropbox/remote-dev/`, you should see a `soft link` like:

        ```
        lrwxrwxrwx 1 xxx yyy loopback-mongo-sandbox.sync -> /home/pulkit/dev/loopback-mongo-sandbox
        ```
1. On remote, when you check the status via: `dropbox status` ... you will see that the sync has begun
    ```
    Syncing (353 files remaining)
    Indexing 353 files...
    ```
1. Setup dropbox on local machine
1. On local, setup the following env variables:

    ```
    # edit and replace any env variable's value, based on your needs
    # or feel free to use the defaults
    # if a dir specified as a value doesn't exist then create it before setting the env variables
    export SYNC_DEV_HOME=`echo ~/Dropbox/remote-dev`
    export LMS_PROJECT_NAME=loopback-mongo-sandbox
    export LMS_SYNC_DIR_NAME=`echo $LMS_PROJECT_NAME.sync`
    export SLAVE_LMS_HOME=`echo $SYNC_DEV_HOME/$LMS_SYNC_DIR_NAME`

    # spit out and confirm the values for all of the following before proceeding
    echo SYNC_DEV_HOME=$SYNC_DEV_HOME && \
      echo LMS_PROJECT_NAME=$LMS_PROJECT_NAME && \
      echo LMS_SYNC_DIR_NAME=$LMS_SYNC_DIR_NAME && \
      echo SLAVE_LMS_HOME = $SLAVE_LMS_HOME
    ```
    * Optionally, you can create and save a `setenv_slave.sh` file for reuse in future sessions but do not commit it:

        ```
        #!/bin/sh

        echo "###"
        echo Its best to invoke this script as: '. ./setenv_slave.sh' rather than './setenv_slave.sh'
        echo "###"

        export SYNC_DEV_HOME=`echo ~/Dropbox/remote-dev` && \
            export LMS_PROJECT_NAME=loopback-mongo-sandbox && \
            export LMS_SYNC_DIR_NAME=`echo $LMS_PROJECT_NAME.sync` && \
            export SLAVE_LMS_HOME=`echo $SYNC_DEV_HOME/$LMS_SYNC_DIR_NAME` && \
        echo SYNC_DEV_HOME=$SYNC_DEV_HOME && \
            echo LMS_PROJECT_NAME=$LMS_PROJECT_NAME && \
            echo LMS_SYNC_DIR_NAME=$LMS_SYNC_DIR_NAME && \
            echo SLAVE_LMS_HOME = $SLAVE_LMS_HOME
        ```
1. On local, Dropbox's autosync will create a directory and you can jump into it: `cd $SLAVE_LMS_HOME`
1. On local, open your favorite IDE and start working
    * for example, visual studio can be opened with: `cd $SLAVE_LMS_HOME && code .`
1. On remote, create empty env files: `cd $LMS_HOME && touch .env worker.env`
    * `.env` is used to configure environment variables for features like [reset password](/tutorials/add-reset-password.md)
    * `worker.env` is used to configure environment variables for features like [add workers](/tutorials/add-workers.md)
1. On remote, install dependencies: `docker-compose run builder npm install`
1. You can choose to build and run in:
    * the background: `docker-compose up -d`
    * or the foreground: `docker-compose up`
1. Open application in your browser with url `http://<remote_IP_or_FQDN>:3000/explorer`
    * If your remote machine hasa firewall, then you may need to configure it to allow traffic on port 3000.
