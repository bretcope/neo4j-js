[« Documentation Home](Documentation.md)

# Relationship Class

Relationship objects represent relationships (graph edges) in neo4j. They inherit from the [Base](Base.md) class.

> This class is incomplete. It will likely have more methods/properties in the near future.

**[Properties](#properties)**

* [data](#data)
* [end](#end)
* [id](#id)
* [start](#start)

**[Methods](#methods)**

* [deleteProperties](#deleteproperties)
* [index](#index)
* [refreshProperties](#refreshproperties)
* [removeFromIndex](#removefromindex)
* [replaceAllProperties](#replaceallproperties)
* [setProperties](#setproperties)
* [setProperty](#setproperty)
* [valueOf](#valueof)

## Constructor

The `Relationship` constructor is internal. Objects are instantiated by various library functions, for example [Graph.getRelationship](Graph.md#getrelationship).

## Properties

### data

Inherited from [Base.data](Base.md#data)

### end

```scala
(String) Relationship.end
```

Represents the ID of the end Node.

### id

Inherited from [Base.id](Base.md#id)

### start

```scala
(String) Relationship.start
```

Represents the ID of the start Node.

## Methods

### deleteProperties

Inherited from [Base.deleteProperties](Base.md#deleteproperties)

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