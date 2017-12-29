# Motivation

In the past we've added a [simple worker](/tutorials/add-workers.md) whose lifecycle is orchestrated by docker. And now we want the added convenience of:

1. selecting tasks from a queue
1. by integrating an established [worker+queue framework](/tutorials/add-workers.md) that takes on the added responsibility of:
    1. selecting a queue implementation
    1. replacing the queue implementation as needed
    1. providing clear directions on how to place payloads in the queue
    1. providing a well defined task schema
    1. allowing the author of the worker to focus solely on writign their business logic into the worker

# Solution

1. Find an image for `ShoppinPal/node-worker` on DockerHub and add it to `docker-compose.yml` like so:

    ```
      worker-framework:
        image: shoppinpal/node-worker
        env_file: .env
        depends_on:
          - mongo
    ```
1. OR, if it hasn't been published, then [build an image from the remote git repository]((https://stackoverflow.com/questions/34120504/how-can-i-make-docker-compose-build-an-image-from-a-remote-git-repository)) easily by adding it to `docker-compose.yml` like so:

    ```
      worker-framework:
        build: https://github.com/ShoppinPal/node-worker.git
        env_file: .env
        depends_on:
          - mongo
    ```
1. As [instructed](https://github.com/ShoppinPal/node-worker#env-file), update and replace the key/value pairs in the `.env` file. For example, we will update the `MONGO_DB_URL` to point at `mongo:3001`:

    ```
    APP_ROOT_PATH=/apps/lib/workers
    MONGO_DB_URL=mongodb://mongo:27017/workerDB
    ```
