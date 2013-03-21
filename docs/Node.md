[« Documentation Home](Documentation.md)

# Node Class

Node objects represent nodes in neo4j. They inherit from the [Base](Base.md) class.

**[Properties](#properties)**

* [data](#data)
* [id](#id)

**[Methods](#methods)**

* [createRelationshipFrom](#createrelationshipfrom)
* [createRelationshipTo](#createrelationshipto)
* [deleteProperties](#deleteproperties)
* [getAllRelationships](#getallrelationships)
* [getIncomingRelationships](#getincomingrelationships)
* [getOutgoingRelationships](#getoutgoingrelationships)
* [index](#index)
* [refreshProperties](#refreshproperties)
* [removeFromIndex](#removefromindex)
* [replaceAllProperties](#replaceallproperties)
* [setProperties](#setproperties)
* [setProperty](#setproperty)
* [valueOf](#valueof)

## Constructor

The `Node` constructor is internal. Objects are instantiated by various library functions, for example [Graph.getNode](Graph.md#getnode).

## Properties

### data

Inherited from [Base.data](Base.md#data)

### id

Inherited from [Base.id](Base.md#id)

## Methods

### createRelationshipFrom

```scala
Node.createRelationshipFrom ( [Batch,] Node node, String type, Function callback )
Node.createRelationshipFrom ( [Batch,] Node node, String type, Object data, Function callback )
Node.createRelationshipFrom ( [Batch,] String|Number nodeId, String type, Function callback )
Node.createRelationshipFrom ( [Batch,] String|Number nodeId, String type, Object data, Function callback )
```

Creates a new relationship from the node represented by `node` or `nodeId` arguments to 'this' node.

`node`
* The `Node` from which the relationship will be created to 'this' `Node`.

`nodeId`
* Instead of supplying a `Node` object, a node ID can be provided as a string or a number.

`type`
* The relationship type.

`data`
* Allows properties to be set on the relationship at the time of creation.

`callback`
* Signature: `Function (error, relationship)`
    * `relationship` A [Relationship](Relationship.md) object.

### createRelationshipTo

Identical to [createRelationshipFrom](#createrelationshipfrom) except that the relationship direction is reversed.

### deleteProperties

Inherited from [Base.deleteProperties](Base.md#deleteproperties)

### getAllRelationships

```scala
Node.getAllRelationships ( [Batch,] Function callback )
Node.getAllRelationships ( [Batch,] String type, Function callback )
Node.getAllRelationships ( [Batch,] Array types, Function callback )
```

DESCRIPTION

`type`
* Limits request to only relationships of one type.

`types`
* An array of strings which limit the request to only relationships with types listed in `types`.

`callback`
* Signature: `Function (error, relationships)`
    * `relationships` An array of [Relationship](Relationship.md) objects. If no relationships are found, `relationships.length === 0`.

### getIncomingRelationships

Identical to [getAllRelationships](#getallrelationships) except that only incoming relationships are requested.

### getOutgoingRelationships

Identical to [getAllRelationships](#getallrelationships) except that only outgoing relationships are requested.

### index

Inherited from [Base.index](Base.md#index)

### refreshProperties

Inherited from [Base.refreshProperties](Base.md#refreshproperties)

### removeFromIndex

Inherited from [Base.removeFromIndex](Base.md#removefromindex)

### replaceAllProperties

Inherited from [Base.replaceAllProperties](Base.md#replaceallproperties)

### setProperties

Inherited from [Base.setProperties](Base.md#setproperties)

### setProperty

Inherited from [Base.setProperty](Base.md#setproperty)

### valueOf

Inherited from [Base.valueOf](Base.md#valueof)