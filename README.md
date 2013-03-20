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

A comprehensive checklist of which API methods have and have not been implemented so far is available in the [Rest.md](REST.md) file.

All of the methods have only been tested on neo4j 1.8.2 so far. Backwards compatibility characteristics are unknown. 

##### Cypher Queries

Cypher Queries with and without params are fully supported, however, nested results are not currently parsed for Node/Relationship/Path objects. In other words, nested results are returned raw.

##### Node and Relationship API Endpoints

Nearly all Node and Relationship endpoint features are implemented. See the [Rest.md](REST.md) file for details.

##### Indexing

Currently indexing is not supported at all (besides auto indexing and using Cypher queries). This is the next major priority and should be expected soon.

##### Graph Algorithms

The built in graph algorithms of shortest path and Dijkstra are supported through the REST API, but not yet through this library. It is, however, a priority and should be relatively easy.

##### Gremlin Plugin

Gremlin support has not been implemented yet. Priority is considered low since Cypher queries are available, and preferred in most cases.

## Usage

Since effort is currently focused primarily on coding, the examples below are provided to help get you started, but are far from comprehensive. The best place to look for examples in the meantime is probably the [unit tests](#unit-testing) found inside the `/test` folder.

##### Install

```
npm install neo4j-js
```

##### Connecting

```javascript

neo4j.connect('http://localhost:7474/db/data/', function (err, graph) {
    if (err)
        throw err;
        
    // do something with the graph
});
```

##### Creating Nodes

```javascript
graph.createNode({ prop1: 'node property', boolProperty: false }, function (err, node) {
    console.log(err ? err : node);
});
```

##### Get Node By Id

```javascript
graph.getNode(5, function (err, node) {
    console.log(err ? err : node.data); // print the node's properties
}
```

##### Get Multiple Nodes

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

##### Cypher Queries

```javascript
var query = [
    'START n = node({id})',
    'MATCH m-[r]-n',
    'RETURN m, r'
];

graph.query(query.join('\n'), { id: 1 }, function (err, obj) {
    if (err) {
        console.log(err);
        console.log(err.stack);
    }
    else {
        for (var i = 0; i < obj.length; i++) {
            var relationship = obj[i].r;
            var node = obj[i].m;
            
            // ... do something with the nodes and relationships we just grabbed 
        }
        
        console.log(JSON.stringify(obj, null, 5 )); // may help to print the returned structure
    }
});
```

## Unit Testing

Some unit tests are in place, and several more will follow soon.

The unit tests rely on [Mocha](http://visionmedia.github.com/mocha/) and [Chai](http://chaijs.com/) which are included as development dependencies in the npm package. If you are not concerned about unit testing, you can omit downloading Mocha and Chai during install by including the production flag `npm install neo4j-js --production`.
 
To run the unit tests:

* Copy `test/config.sample.json` to `test/config.json` and edit as necessary.
* Go to the root `neo4j-js` directory and type `mocha`.