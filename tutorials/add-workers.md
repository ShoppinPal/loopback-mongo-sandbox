# Motivation

1. Each worker "run" should be clean.
    * A worker should NOT stay alive to finish more than one job.
    * A worker should exit successfully or fail with errors for the one job assigned to it, nothing more.
    * Memory leaks, if any should die with the worker's exit.
1. Workers should be scalable.
1. Something should orchestrate the workers so that they:
    * repeatedly spring to life,
    * do a job,
    * and then exit.


# Solution

1. Create a `worker` folder to house a simplistic worker.
    1. Setup a worker service in `docker-compose.yml`

        ```
        worker:
            #restart: always
            image: node:6.10.1
            volumes:
                - ./worker/simpleWorker.js:/apps/simpleWorker.js
            working_dir: /apps
            entrypoint: node
            command: node /apps/simpleWorker.js
            env_file: worker.env
        ```
    1. Test the worker: `docker-compose run worker`
1. For scaling refer to: `https://docs.docker.com/compose/reference/scale/`
1. After testing, you can uncomment docker's keepalive (`restart:always`) policy to bring workers back to life:

    ```
    worker:
        restart: always
        ...
    ```
    * Now `docker-compose up worker` or `docker-compose up` will orchestrate the lifecycle of workers.

# Research

* docker runs cron, cron runs job
    * Simple HowTo(s):
        * https://www.ekito.fr/people/run-a-cron-job-with-docker/
            * reference implementation(s):
                * [Ekito/docker-cron](https://github.com/Ekito/docker-cron)
                * [cheyer/docker-cron](https://github.com/cheyer/docker-cron)
    * Advanced HowTo(s):
        * http://www.anotherchris.net/posts/running-cron-jobs-inside-a-docker-container
        * https://www.tddapps.com/2016/05/05/how-to-run-node-cron-jobs-in-a-docker-container/
            * "drop-in" reference implementation(s):
                * [camilin87/node-cron](https://github.com/camilin87/node-cron)
* docker runs supervisor, supervisor runs cron, cron runs job
    * https://gist.github.com/jdeathe/94d7b1681187a3a97c5cd4a7eee244f1#configure-crond-to-run-under-supervisord
* docker runs cron container, which spawns job containers on a schedule
    * https://www.tddapps.com/2017/02/18/how-to-run-any-container-on-a-schedule/
        * "drop-in" reference implementation(s):
            * [camilin87/docker-cron](https://github.com/camilin87/docker-cron)
