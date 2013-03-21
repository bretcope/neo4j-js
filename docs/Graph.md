# Graph Class

[« Documentation Home](Documentation.md)

A graph class represents a connection to a particular neo4j database.

## Constructor

The `Graph` constructor is internal. A `Graph` object is retruned from `connect` as follows:

```javascript
var neo4j = require('neo4j-js');
neo4j.connect('http://localhost:7474/db/data/', function (error, graph) {
    // do something with graph object
})
```

After calling `connect`, the returned `Graph` object should be stored in a way which makes it accessible within your application without calling `connect` again.

Since neo4j uses a REST API, it is inherently stateless, meaning, if the connection goes down, requests will fail until access is restored, but there is no need to 'reconnect' as would be the case in a socket-based API protocol.

## Properties

### version

```scala
String Graph.version
```

The version string as reported by neo4j.

## Methods

### createBatch

```scala
(Batch) Graph.createBatch (  )
```

Instantiates a [Batch](Batch.md) object which can be used to manually group API calls into a single batch request. Most library methods accept a `Batch` object as an optional first parameter.

### reconnect

Allows a graph object to be re-associated with a different server.

> This method is not stable yet, and should not be used. Specifically, it will cause all associated objects to become invalid.