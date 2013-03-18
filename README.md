# neo4j-js

A Node.js (pure JavaScript) client library for accessing neo4j databases with batch support.

Usage documentation and examples coming soon...

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

#### Current Status

A comprehensive checklist of which API methods have and have not been implemnted so far is available in the [Rest.md](REST.md) file.

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
 