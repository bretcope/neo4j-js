# REST API Support

This page is to document which REST API features are implemented in some fashion within this library.

## 

```javascript
[ ] Not implemented yet
[x] Implemented
[*] Implemented, but see caveat
[!] Will not be implemented

Service Root (17.1)
[x] 17.1.1. Get service root

Cypher Queries (17.3)
[x] 17.3.1. Send queries with parameters
[x] 17.3.2. Send a Query
[x] 17.3.3. Return paths
[*] 17.3.4. Nested results     * "Nested results are not parsed to look for objects."
[*] 17.3.5. Profile a query    * "Untested, and implementation may change"
[x] 17.3.6. Server errors

Nodes (17.5)
[x] 17.5.1. Create node
[x] 17.5.2. Create node with properties
[x] 17.5.3. Get node
[x] 17.5.4. Get non-existent node
[x] 17.5.5. Delete node
[x] 17.5.6. Nodes with relationships can not be deleted

Relationships (17.6)
[x] 17.6.1. Get Relationship by ID
[x] 17.6.2. Create relationship
[x] 17.6.3. Create a relationship with properties
[x] 17.6.4. Delete relationship
[x] 17.6.5. Get all properties on a relationship
[x] 17.6.6. Set all properties on a relationship
[ ] 17.6.7. Get single property on a relationship  "No direct implementation to get only a single property"
[x] 17.6.8. Set single property on a relationship
[x] 17.6.9. Get all relationships
[x] 17.6.10. Get incoming relationships
[x] 17.6.11. Get outgoing relationships
[x] 17.6.12. Get typed relationships
[x] 17.6.13. Get relationships on a node without relationships

Relationship Types (17.7)
[x] 17.7.1. Get relationship types

Node Properties (17.8)
[x] 17.8.1. Set property on node
[x] 17.8.2. Update node properties
[x] 17.8.3. Get properties for node
[x] 17.8.4. Property values can not be null
[x] 17.8.5. Property values can not be nested
[x] 17.8.6. Delete all properties from node
[x] 17.8.7. Delete a named property from a node

Relationship Properties (17.9)
[x] 17.9.1. Update relationship properties
[x] 17.9.2. Remove properties from a relationship
[x] 17.9.3. Remove property from a relationship
[x] 17.9.4. Remove non-existent property from a relationship
[x] 17.9.5. Remove properties from a non-existing relationship
[x] 17.9.6. Remove property from a non-existing relationship

Indexes (17.10)
[x] 17.10.1. Create node index
[x] 17.10.2. Create node index with configuration
[x] 17.10.3. Delete node index
[x] 17.10.4. List node indexes
[x] 17.10.5. Add node to index
[x] 17.10.6. Remove all entries with a given node from an index
[x] 17.10.7. Remove all entries with a given node and key from an index
[x] 17.10.8. Remove all entries with a given node, key and value from an index
[*] 17.10.9. Find node by exact match  "Implemented using a Cypher query rather than the REST query endpoint."
[!] 17.10.10. Find node by query
        "Because the query style depends on the index provider, it is probably best to not wrap this endpoint."

Unique Indexes (17.11)
[ ] 17.11.1. Get or create unique node (create)
[ ] 17.11.2. Get or create unique node (existing)
[ ] 17.11.3. Create a unique node or return fail (create)
[ ] 17.11.4. Create a unique node or return fail (fail)
[ ] 17.11.5. Get or create unique relationship (create)
[ ] 17.11.6. Get or create unique relationship (existing)
[ ] 17.11.7. Create a unique relationship or return fail (create)
[ ] 17.11.8. Create a unique relationship or return fail (fail)

Automatic Indexes (17.12)
[*] 17.12.1. Find node by exact match from an automatic index  "** See 17.10.9 note."
[!] 17.12.2. Find node by query from an automatic index  "** See 17.10.10 note."

Configurable Automatic Indexing (17.13)
[x] 17.13.1. Create an auto index for nodes with specific configuration
[x] 17.13.2. Create an auto index for relationships with specific configuration
[x] 17.13.3. Get current status for autoindexing on nodes
[x] 17.13.4. Enable node autoindexing
[x] 17.13.5. Lookup list of properties being autoindexed
[x] 17.13.6. Add a property for autoindexing on nodes
[x] 17.13.7. Remove a property for autoindexing on nodes

Traversals (17.14)
[ ] 17.14.1. Traversal using a return filter
[ ] 17.14.2. Return relationships from a traversal
[ ] 17.14.3. Return paths from a traversal
[ ] 17.14.4. Traversal returning nodes below a certain depth
[ ] 17.14.5. Creating a paged traverser
[ ] 17.14.6. Paging through the results of a paged traverser
[ ] 17.14.7. Paged traverser page size
[ ] 17.14.8. Paged traverser timeout

Built-in Graph Algorithms (17.15)
[ ] 17.15.1. Find all shortest paths
[ ] 17.15.2. Find one of the shortest paths between nodes
[ ] 17.15.3. Execute a Dijkstra algorithm with similar weights on relationships
[ ] 17.15.4. Execute a Dijkstra algorithm with weights on relationships

Batch Operations (17.16)
[x] 17.16.1. Execute multiple operations in batch
[ ] 17.16.2. Refer to items created earlier in the same batch job "Not sure how (or if) this might be supported yet"
[x] 17.16.3. Execute multiple operations in batch streaming

Gremlin Plugin (17.18)
[ ] 17.18.1. Send a Gremlin Script - URL encoded
[ ] 17.18.2. Load a sample graph
[ ] 17.18.3. Sort a result using raw Groovy operations
[ ] 17.18.4. Send a Gremlin Script - JSON encoded with table results
[ ] 17.18.5. Returning nested pipes
[ ] 17.18.6. Set script variables
[ ] 17.18.7. Send a Gremlin Script with variables in a JSON Map
[ ] 17.18.8. Return paths from a Gremlin script
[ ] 17.18.9. Send an arbitrary Groovy script - Lucene sorting
[ ] 17.18.10. Emit a sample graph
[ ] 17.18.11. HyperEdges - find user roles in groups
[ ] 17.18.12. Group count
[ ] 17.18.13. Collect multiple traversal results
[ ] 17.18.14. Collaborative filtering
[ ] 17.18.15. Chunking and offsetting in Gremlin
[ ] 17.18.16. Modify the graph while traversing
[ ] 17.18.17. Flow algorithms with Gremlin
[ ] 17.18.18. Script execution errors

```
