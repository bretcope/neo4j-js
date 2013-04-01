# neo4j-js

A Node.js (pure JavaScript) client library for accessing neo4j databases with batch support.

### Goals

* Support as much (or all) of the REST API as possible.
* Batch processing (both manual and through automatic shortcuts).
* Have intuitive function "overloads" for usability.
* Pure JavaScript without dependencies.

#### Rationale (or, why another Node.js library for neo4j?)

A Node.js client library already exists for neo4j: [https://github.com/thingdom/node-neo4j](https://github.com/thingdom/node-neo4j). It has been around since 2011 and is likely a good choice for Node.js/neo4j projects which need a proven solution in the near future.

After looking at `node-neo4j`, I found a few things which prompted me to write my own library:

* No batch support
* Odd node creation syntax
* Development seems to have stalled
* Written in CoffeeScript (just a personal preference)

## Current Status

> Note: This library is in the early stages of development, is incomplete, and not by any means guaranteed to be stable. If you have input, or are interested in contributing to development or testing, __please contact me!__ My email address is on my [github account](https://github.com/bretcope), or you can use the [issue tracker](https://github.com/bretcope/neo4j-js/issues).

A comprehensive checklist of which API methods have and have not been implemented so far is available in the [Rest.md](docs/REST.md) file.

All of the methods have only been tested on neo4j 1.8.2 so far. Backwards compatibility characteristics are unknown. 

##### Cypher Queries

Cypher Queries with and without params are fully supported, however, nested results are not currently parsed for Node/Relationship/Path objects. In other words, nested results are returned raw.

##### Node and Relationship API Endpoints

Nearly all Node and Relationship endpoint features are implemented. See the [Rest.md](docs/REST.md) file for details.

##### Indexing

Indexing is partially implemented. Indexes can be created, deleted, listed, and queried. Key/value pairs can be inserted and removed from indexes using nodes and relationships. Automatic Indexing can be configured. Unique Indexing features are being worked on currently.

##### Graph Algorithms

The built in graph algorithms of shortest path and Dijkstra are supported through the REST API, but not yet through this library. It is, however, a priority and should be relatively easy.

##### Gremlin Plugin

Gremlin support has not been implemented yet. Priority is considered low since Cypher queries are available, and preferred in most cases.

## Usage

The examples below are provided to help get you started, but are far from comprehensive. [Reference Documentation](docs/Documentation.md) is currently being worked on. Another place to look for examples in the meantime are the [unit tests](#unit-testing) found inside the `/test` folder.

### Install

```
npm install neo4j-js
```

### Connecting

```javascript
neo4j.connect('http://localhost:7474/db/data/', function (err, graph) {
    if (err)
        throw err;
        
    // do something with the graph
});
```

### Creating Nodes

[Graph.createNode reference](docs/Graph.md#createnode)

```javascript
graph.createNode({ prop1: 'node property', boolProperty: false }, function (err, node) {
    console.log(err ? err : node);
});
```

### Get Node By Id

[Graph.getNode reference](docs/Graph.md#getnode)

```javascript
graph.getNode(5, function (err, node) {
    console.log(err ? err : node.data); // print the node's properties
}
```

### Get Multiple Nodes

[Graph.getNode reference](docs/Graph.md#getnode)

```javascript
graph.getNode([5, 23, 84], function (err, nodes) {
    if (err) {
        console.log(err)
        return;
    }
    
    for (var i in nodes)
        console.log(nodes[i].data);
}
```

### Cypher Queries

See [Graph.query](docs/Graph.md#query) for an example.

### Batching

Most of the library functions optionally accept a [Batch](docs/Batch.md) object as the first argument. This allows multiple API calls to be grouped into a single request which may significantly improve performance in some cases.

```javascript
var batch = graph.createBatch();

//create a node and get another in the same request
graph.createNode(batch, { key: 'value' }, function (error, node) {
    //this will not be called until after batch.run()
});
graph.getNode(batch, 18, function (error, node) {
    //this will not be called until after batch.run()
});

batch.run();
```

## Unit Testing

Some unit tests are in place, and more should follow as appropriate.

The unit tests rely on [Mocha](http://visionmedia.github.com/mocha/) and [Chai](http://chaijs.com/) which are included as development dependencies in the npm package. If not installed already, go to the `node_modules/neo4j` directory and type `npm install`.
 
To run the unit tests:

* Copy `test/config.sample.json` to `test/config.json` and edit as necessary.
* Go to the root `neo4j-js` directory and type `mocha`.
