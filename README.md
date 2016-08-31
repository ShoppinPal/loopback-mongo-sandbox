### FAQ
* Why was this project created?
 * To provide a quick way to experiment with loopback and mongo together.
* Why use docker?
 * Its not just `docker` but rather `docker-compose` alongside it that gives `a quick way` to bring servers up and get going.
* Are there other such projects?
 * Sure, searching on GitHub with [loopback mongo filename:docker-compose.yml](https://github.com/search?utf8=%E2%9C%93&q=mongo+filename%3Adocker-compose.yml+loopback&type=Code&ref=searchresults), yields close to 6 results when this line in the README was last edited.
* How can I access loopback once its running?
  * Open your browser to `http://localhost:3000/explorer` and play around.
* How can I access mongo once its running?
  * Use `mongo shell` or `RoboMongo` or `MongoChef` or any client you best see fit .. to connect to `mongodb://localhost:3001/loopback-mongo-sandbox` from your host machine.
* Why is loopback published on its default port `3000` but mongo is published to a non-default port `3001`?
  * Background: Loopback refers to mongo via the url `mongodb://mongo:27017/loopback-mongo-sandbox` which leverages the mapping created by `docker-compose` for the `mongo` service.
  * Answer: If mongo was published on its default port then `mongodb://localhost:27017/loopback-mongo-sandbox` would also start working as a valid URL within `datasources.json` and users wouldn't notice a difference. I wanted to discourage that and bring attention to the benefits of referencing a service by name. You won't live on localhost forever, as your code will reach the world one day!

### Run it

```
cd ~/dev
git clone https://github.com/ShoppinPal/loopback-mongo-sandbox.git
cd ~/dev/loopback-mongo-sandbox
npm install
docker-compose up
```
