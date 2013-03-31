[« Documentation Home](Documentation.md)

# Graph Class

A graph class represents a connection to a particular neo4j database.

**[Properties](#properties)**

* [version](#version)

**[Methods](#methods)**

**Node Related Methods**

* [createNode](#createnode)
* [createNodeIndex](#createnodeindex)
* [deleteNode](#deletenode)
* [deleteNodeIndex](#deletenodeindex)
* [getNode](#getnode)
* [isNode](#isnode)
* [listNodeIndexes](#listnodeindexes)
* [nodeExactQuery](#nodeexactquery)

**Relationship Related Methods**

* [createRelationshipIndex](#createrelationshipindex)
* [deleteRelationship](#deleterelationship)
* [deleteRelationshipIndex](#deleterelationshipindex)
* [getRelationship](#getrelationship)
* [getRelationshipTypes](#getrelationshiptypes)
* [isRelationship](#isrelationship)
* [listRelationshipIndexes](#listrelationshipindexes)
* [relationshipExactQuery](#relationshipexactquery)

**Auto-Indexing Related Methods**

* [addNodeAutoIndexProperty](#addnodeautoindexproperty)
* [addRelationshipAutoIndexProperty](#addrelationshipautoindexproperty)
* [createNodeIndex](#createnodeindex)
* [createRelationshipIndex](#createrelationshipindex)
* [getNodeAutoIndexingStatus](#getnodeautoindexingstatus)
* [getRelationshipAutoIndexingStatus](#getrelationshipautoindexingstatus)
* [listNodeAutoIndexProperties](#listnodeautoindexproperties)
* [listRelationshipAutoIndexProperties](#listrelationshipautoindexproperties)
* [removeNodeAutoIndexProperty](#removenodeautoindexproperty)
* [removeRelationshipAutoIndexProperty](#removerelationshipautoindexproperty)
* [setNodeAutoIndexingStatus](#setnodeautoindexingstatus)
* [setRelationshipAutoIndexingStatus](#setrelationshipautoindexingstatus)

**Other Methods**

* [createBatch](#createbatch)
* [isPath](#ispath)
* [query](#query)
* [reconnect](#reconnect)

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

### addNodeAutoIndexProperty

```scala
Graph.addNodeAutoIndexProperty ( [Batch,] String property, Function callback )
```

Adds a property which will be automatically indexed for nodes (if automatic indexes are enabled.) See http://docs.neo4j.org/chunked/stable/auto-indexing.html

`property`
* The name of the property to index.

`callback`
* Signature: `Function (error)`

### addRelationshipAutoIndexProperty

```scala
Graph.addRelationshipAutoIndexProperty ( [Batch,] String property, Function callback )
```

The relationships version of [addNodeAutoIndexProperty](#addnodeautoindexproperty)

### createBatch

```scala
(Batch) Graph.createBatch (  )
```

Instantiates a [Batch](Batch.md) object which can be used to manually group API calls into a single batch request. Most library methods accept a `Batch` object as an optional first parameter.

### createNode

```scala
Graph.createNode ( [Batch,] Function callback )
Graph.createNode ( [Batch,] Object data, Function callback )
```

Creates a node in neo4j.

`data`
* Allows properties to be set on the node at creation time. Note that there are limitations on this object, such as nesting is prohibited. See: http://docs.neo4j.org/chunked/1.9.M05/rest-api-property-values.html for more details.

`callback`
* Signature: `Function (error, node)`
    * `node` If successful, a [Node](Node.md) object

### createNodeIndex

```scala
Graph.createNodeIndex ( [Batch,] String name, Function callback )
Graph.createNodeIndex ( [Batch,] String name, Object config, Function callback )
Graph.createNodeIndex ( [Batch,] Function callback )
Graph.createNodeIndex ( [Batch,] Object config, Function callback )
```

Creates a node index.

`name`
* The name of the index to be created. If `name` is not specified, `'node_auto_index'` is assumed. See warnings in regards to auto-index creation: http://docs.neo4j.org/chunked/stable/rest-api-configurable-auto-indexes.html

`config`
* Allows a configuration to be specified. If omitted, the default configuration will be used. See http://docs.neo4j.org/chunked/stable/rest-api-indexes.html#rest-api-create-node-index-with-configuration

`callback`
* Signature: `Function (error)`

### createRelationshipIndex

```scala
Graph.createRelationshipIndex ( [Batch,] String name, Function callback )
Graph.createRelationshipIndex ( [Batch,] String name, Object config, Function callback )
Graph.createRelationshipIndex ( [Batch,] Function callback )
Graph.createRelationshipIndex ( [Batch,] Object config, Function callback )
```

Creates a relationship index. See [createNodeIndex](#createnodeindex) for parameter descriptions. `name` defaults to `'relationship_auto_index'`.

### deleteNode

```scala
Graph.deleteNode ( [Batch,], Mixed id, Function callback )
```

Deletes a node. If a node has relationships, attempting to delete it will fail. For this reason, it is generally recommended to delete nodes using Cypher queries.

`id`
* A string or number representing the ID of the node to delete.

`callback`
* Signature: `Function (error)`

### deleteNodeIndex

```scala
Graph.deleteNodeIndex ( [Batch,] String name, Function callback )
```

Deletes a node index.

`name`
* The name of the index to delete.

`callback`
* Signature: `Function (error)`

### deleteRelationship

```scala
Graph.deleteRelationship ( [Batch,], Mixed id, Function callback )
```

Deletes a relationship.

`id`
* ID of the relationship to delete.

`callback`
* Signature: `Function (error)`

### deleteRelationshipIndex

```scala
Graph.deleteRelationshipIndex ( [Batch,] String name, Function callback )
```

Deletes a relationship index. See [deleteNodeIndex](#deletenodeindex) for parameter descriptions.

### getNode

```scala
Graph.getNode ( [Batch,] Mixed id, Function callback )
Graph.getNode ( [Batch,] Array ids, Function callback )
```

Gets a node by ID.

`id`
* String or number representing the ID of the node to search for.

`ids`
* An array of ID's. This provides automatic batching of get node requests. It is roughly equivalent to creating a batch, calling `getNode` multiple times with the batch parameter, then executing `batch.run()`, except for the fact that when using `ids`, the callback will only be called once with an array of nodes instead of being called once per node. It is important to note that if one request in a batch fails (such as 404 not found), the entire batch fails. This is true for both manual and automatic batching.

`callback`
* If the node is not found `error.code` will equal `404`. Signature: `Function (error, node)`
    * `node` If found, a [Node](Node.md) object. (If the `ids` parameter was used, `node` will actually be an array of Nodes.)

### getNodeAutoIndexingStatus

```scala
Graph.getNodeAutoIndexingStatus ( [Batch,] Function callback )
```

Gets whether automatic node indexing is enabled or not.

`callback`
* Signature: `Function (error, status)`
    * `status` A Boolean representing the auto-indexing status.

### getRelationship

```scala
Graph.getRelationship ( [Batch,] Mixed id, Function callback )
Graph.getRelationship ( [Batch,] Array ids, Function callback )
```

Gets a relationship by ID.

`id`
* String or number representing the ID of the relationship to search for.

`ids`
* See the equivalent description above in [getNode](#getnode).

`callback`
* If the node is not found `error.code` will equal `404`. Signature: `Function (error, relationship)`
    * `relationship` If found, a [Relationship](Relationship.md) object. (If the `ids` parameter was used, `relationship` will actually be an array of Relationships.)

### getRelationshipAutoIndexingStatus

```scala
Graph.getRelationshipAutoIndexingStatus ( [Batch,] Function callback )
```
The relationships version of [getNodeAutoIndexingStatus](#getnodeautoindexingstatus).

### getRelationshipTypes

```scala
Graph.getRelationshipTypes ( [Batch,] Function callback )
```

Gets a list of all relationship types. The list does not necessarily indicate that each relationship type is in use.

`callback`
* Signature: `Function (error, types)`
    * `types` An array of strings representing the names of all relationship types.

### isNode

```scala
(Boolean) Graph.isNode ( Mixed node )
```

Returns `true` if `node` is a [Node](Node.md) object, otherwise `false`.

> Each `Graph` object has its own unique copy of the [Node](Node.md) class. This means only Nodes instantiated using this graph object will evaluate to true. Nodes instantiated through a different graph object will evaluate to false. 

### isRelationship

```scala
(Boolean) Graph.isRelationship ( Mixed relationship )
```

Returns `true` if `relationship` is a [Relationship](Relationship.md) object, otherwise `false`.

> Each `Graph` object has its own unique copy of the [Relationship](Relationship.md) class. This means only Relationships instantiated using this graph object will evaluate to true. Relationships instantiated through a different graph object will evaluate to false. 

### isPath

```scala
(Boolean) Graph.isPath ( Mixed path )
```

Returns `true` if `path` is a [Path](Path.md) object, otherwise `false`.

> Each `Graph` object has its own unique copy of the [Path](Path.md) class. This means only Paths instantiated using this graph object will evaluate to true. Paths instantiated through a different graph object will evaluate to false.

### listNodeAutoIndexProperties

```scala
Graph.listNodeAutoIndexProperties ( [Batch,] Function callback )
```

Gets a list of properties currently being automatically indexed for nodes.

`callback`
* Signature: `Function (error, properties)`
    * `properties` An array of strings representing the list of properties.

### listNodeIndexes

```scala
Graph.listNodeIndexes ( [Batch,] Function callback )
```

Gets a list of node indexes.

`callback`
* Signature: `Function (error, indexes)`
    * `indexes` Simply the JSON.parse from the REST API response. See http://docs.neo4j.org/chunked/stable/rest-api-indexes.html#rest-api-list-node-indexes for details on the object's structure.

### listRelationshipAutoIndexProperties

```scala
Graph.listRelationshipAutoIndexProperties ( [Batch,] Function callback )
```

The relationships version of [listNodeAutoIndexProperties](#listnodeautoindexproperties).

### listRelationshipIndexes

```scala
Graph.listRelationshipIndexes ( [Batch,] Function callback )
```

Same as [listNodeIndexes](#listnodeindexes), except for relationship indexes.

### nodeExactQuery

```scala
Graph.nodeExactQuery ( [Batch,] String key, Mixed value, Function callback )
Graph.nodeExactQuery ( [Batch,] String index, String key, Mixed value, Function callback )
```

Queries an index for nodes matching the `key` and `value`.

`index`
* The name of the index to query. If omitted, `"node_auto_index"` will be used.

`key`
* The key to search on.

`value`
* The value to search for.

`callback`
* Signature: `Function (error, nodes)`
    * `nodes` An array of [Node](Node.md) objects. If zero nodes are found, `nodes.length === 0`.

### query

```scala
Graph.query ( [Batch,] String query, Function callback )
Graph.query ( [Batch,] String query, Object params, Function callback )
Graph.query ( [Batch,] Boolean profile, String query, Function callback )
Graph.query ( [Batch,] Boolean profile, String query, Object params, Function callback )
```

Executes an arbitrary [Cypher](http://docs.neo4j.org/chunked/stable/cypher-query-lang.html) query.

`profile`
* This feature is **untested** and requires `neo4j.version >= 1.9`. If true, `results.plan` will represent the query plan. http://docs.neo4j.org/chunked/1.9.M05/rest-api-cypher.html#rest-api-profile-a-query

`query`
* The query string.

`params`
* If any parameters are used in the query string (for example `START n=node({id})`), `params` should be an object representing the key value pairs (for example `{ id:8 }`).

`callback`
* Signature: `Function (error, results)`
    * `results` An array of result rows. Each row is an object of key/value pairs. Values which appear to be [Nodes](Node.md) / [Relationships](Relationship.md) / [Paths](Path.md) are automatically converted into the proper object types.
    
###### Query Example

```javascript
var query = [
    'START n = node({id})',
    'MATCH m-[r]-n',
    'RETURN m, r'
];

graph.query(query.join('\n'), { id: 1 }, function (err, results) {
    if (err) {
        console.log(err);
        console.log(err.stack);
    }
    else {
        for (var i = 0; i < results.length; i++) {
            var relationship = results[i].r;
            var node = results[i].m;
            
            // ... do something with the nodes and relationships we just grabbed 
        }
        
        console.log(JSON.stringify(results, null, 5 )); // printing may help to visualize the returned structure
    }
});
```

### reconnect

Allows a graph object to be re-associated with a different server.

> This method is not stable yet, and should not be used. Specifically, it will cause all associated objects to become invalid.

### relationshipExactQuery

```scala
Graph.relationshipExactQuery ( [Batch,] String key, Mixed value, Function callback )
Graph.relationshipExactQuery ( [Batch,] String index, String key, Mixed value, Function callback )
```

Queries an index for relationships matching the `key` and `value`.

Uses the same parameter descriptions as [nodeExactQuery](#nodeexactquery), except `index` defaults to `"relationship_auto_index"` and `callback` provides an array of [Relationship](Relationship.md) objects instead of Nodes.

### removeNodeAutoIndexProperty

```scala
Graph.removeNodeAutoIndexProperty ( [Batch,] String property, Function callback )
```

The opposite of [addNodeAutoIndexProperty](#addnodeautoindexproperty).

`property`
* The name of the property to stop indexing.

`callback`
* Signature: `Function (error)`

### removeRelationshipAutoIndexProperty

```scala
Graph.removeRelationshipAutoIndexProperty ( [Batch,] String property, Function callback )
```

The relationships version of [removeNodeAutoIndexProperty](#removenodeautoindexproperty).

### setNodeAutoIndexingStatus

```scala
Graph.setNodeAutoIndexingStatus ( [Batch,] Boolean enable, Function callback )
```

Enables or disables automatic node indexing.

`enable`
* `true` to enable, `false` to disable. 

`callback`
* Signature: `Function (error)`

### setRelationshipAutoIndexingStatus

```scala
Graph.setRelationshipAutoIndexingStatus ( [Batch,] Boolean enable, Function callback )
```

The relationships version of [setNodeAutoIndexingStatus](#setnodeautoindexingstatus).
