[« Documentation Home](Documentation.md)

# Base Class

Both [Node](Node.md) and [Relationship](Relationship.md) classes inherit from this base class. In the documentation below, everywhere that `Base` is used as a type, it is implied to be either a Node or Relationship depending on the usage context.

**Methods**

* [deleteProperties](#deleteproperties)
* [index](#index)
* [refreshProperties](#refreshproperties)
* [removeFromIndex](#removefromindex)
* [replaceAllProperties](#replaceallproperties)
* [setProperties](#setproperties)
* [setProperty](#setproperty)
* [valueOf](#valueof)

## Constructor

Base objects are never directly instantiated. `Base` is essentially a virtual class.

## Properties

### data

```scala
(Object) Base.data
```

Represents the properties associated with this neo4j object. This object is frozen and cannot be edited.

### id

```scala
String Base.id
```

The ID of the node/relationship.

## Methods

### deleteProperties

```scala
Base.deleteProperties ( [Batch,] Function callback )
Base.deleteProperties ( [Batch,] String property, Function callback )
Base.deleteProperties ( [Batch,] Array properties, Function callback )
Base.deleteProperties ( [Batch,] Boolean updateData, Function callback )
Base.deleteProperties ( [Batch,] Boolean updateData, String property, Function callback )
Base.deleteProperties ( [Batch,] Boolean updateData, Array properties, Function callback )
```

Deletes some or all properties.

`updateData`
* By default, a call to [refreshProperties](#refreshproperties) is automatically batched together with this method. To prevent this, set `updateData` to false.

`property`
* The name of the property to delete.

`properties`
* An array of strings representing the properties to delete.

> If neither `property` nor `properties` are provided, all properties will be deleted.

`callback`
* Signature: `Function (error)`

### index

```scala
Base.METHODNAME ( [Batch,] )
```

DESCRIPTION

### refreshProperties

```scala
Base.METHODNAME ( [Batch,] )
```

DESCRIPTION

### removeFromIndex

```scala
Base.METHODNAME ( [Batch,] )
```

DESCRIPTION

### replaceAllProperties

```scala
Base.METHODNAME ( [Batch,] )
```

DESCRIPTION

### setProperties

```scala
Base.METHODNAME ( [Batch,] )
```

DESCRIPTION

### setProperty

```scala
Base.METHODNAME ( [Batch,] )
```

DESCRIPTION

### valueOf

```scala
(String) Base.valueOf ( )
```

Overrides `Object.prototype.valueOf`. Returns `this.id`.