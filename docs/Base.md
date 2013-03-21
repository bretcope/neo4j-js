[« Documentation Home](Documentation.md)

# Base Class

Both [Node](Node.md) and [Relationship](Relationship.md) classes inherit from this base class. In the documentation below, everywhere that `Base` is used as a type, it is implied to be either a Node or Relationship depending on the usage context.

**[Properties](#properties)**

* [data](#data)
* [id](#id)

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

Base objects are never directly instantiated. `Base` is essentially a virtual class.

## Properties

### data

```scala
(Object) Base.data
```

Represents the properties associated with this node/relationship. This object is frozen and cannot be edited.

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

Deletes some or all properties on this node/relationship.

`updateData`
* By default, a call to [refreshProperties](#refreshproperties) is automatically batched together with this method. To prevent this, set `updateData` to false.

`property`
* The name of the property to delete.

`properties`
* An array of strings representing the properties to delete.

> **Note:** If neither `property` nor `properties` arguments are provided, all properties will be deleted.

`callback`
* Signature: `Function (error, properties)`
    * `properties` The updated [Base.data](#data) object. Only provided when `updateData !== false`.

### index

```scala
Base.index ( [Batch,] String index, String key, Mixed value, Function callback )
Base.index ( [Batch,] String index, Object properties, Function callback )
```

Indexes one or more key/value pairs in relation to the node/relationship object.

> **Caution:** This does not overwrite previous entries. If you index the same key/value/item combination twice, two index entries are created. To do update-type operations, you need to [delete the old entry](#removefromindex) before adding a new one.
> *(Excerpt from http://docs.neo4j.org/chunked/stable/rest-api-indexes.html#rest-api-add-node-to-index)*

`index`
* The name of the index.

`key`
* The name of the key being indexed.

`value`
* The value to index.

`properties`
* Allows multiple key/value pairs to be indexed at once. `{ key1: 'value1', key2: 'value2', ... }`

`callback`
* Signature: `Function (error)`

### refreshProperties

```scala
Base.refreshProperties ( [Batch,] Function callback )
```

Updates [Base.data](#data) with the most current properties in neo4j.

`callback`
* Signature: `Function (error, properties)`
    * `properties` The updated [Base.data](#data) object.

### removeFromIndex

```scala
Base.removeFromIndex ( [Batch,] String index, Function callback )
Base.removeFromIndex ( [Batch,] String index, String key, Function callback )
Base.removeFromIndex ( [Batch,] String index, String key, Mixed value, Function callback )
Base.removeFromIndex ( [Batch,] String index, Array keys, Function callback )
Base.removeFromIndex ( [Batch,] String index, Object properties, Function callback )
```

Removes some, or all, index entries for a node/relationship.

`index`
* The name of the index to remove from.

`key`
* The name of the key to remove.

`value`
* If provided, only entries which match both the key and value will be removed.

`keys`
* An array of strings representing multiple keys which should be removed.

`properties`
* Allows multiple keys and values to be specified for removal. Since `null` is not a valid property value in neo4j, if the value of any key is `null`, it will be treated as if no value was provided (meaning that key is eligible for removal regardless of its value in the index).

> If `key`, `value`, `keys`, and `properties` are all omitted, then all key/value pairs associated with the node/relationship will be removed from `index`.

`callback`
* Signature: `Function (error)`

### replaceAllProperties

```scala
Base.replaceAllProperties ( [Batch,] Object properties, Function callback )
Base.replaceAllProperties ( [Batch,] String key, Mixed value, Function callback )
Base.replaceAllProperties ( [Batch,] Boolean updateData, Object properties, Function callback )
Base.replaceAllProperties ( [Batch,] Boolean updateData, String key, Mixed value, Function callback )
```

Replaces all the properties on this node/relationship.

`updateData`
* See description in [deleteProperties](#deleteproperties)

`properties`
* The new data/properties object.

`key`
* If you want to replace all properties with a single property, you can simply provide a single key/value pair as arguments.

`value`
* See `key` parameter above.

`callback`
* Signature: `Function (error, properties)`
    * `properties` The updated [Base.data](#data) object. Only provided when `updateData !== false`.

### setProperties

```scala
Base.setProperties ( [Batch,] Object properties, Function callback )
Base.setProperties ( [Batch,] Boolean updateData, Object properties, Function callback )
```

Sets individual properties on the node/relationship without erasing other properties.

`updateData`
* See description in [deleteProperties](#deleteproperties)

`properties`
* Key/values of the properties to set.

`callback`
* Signature: `Function (error, properties)`
    * `properties` The updated [Base.data](#data) object. Only provided when `updateData !== false`.

### setProperty

```scala
Base.setProperty ( [Batch,] String key, Mixed value, Function callback )
Base.setProperty ( [Batch,] Boolean updateData, String key, Mixed value, Function callback )
```

Sets a property on the node/relationship

`updateData`
* See description in [deleteProperties](#deleteproperties)

`key`
* The property name (key) to set.

`value`
* The value of the property to set.

`callback`
* Signature: `Function (error, properties)`
    * `properties` The updated [Base.data](#data) object. Only provided when `updateData !== false`.
    
> __Note:__ `setProperty` is actually just an alias for [setProperties](#setproperties) and can be used interchangeably, although it probably will make more sense to use them in the manners described above.

### valueOf

```scala
(String) Base.valueOf ( )
```

Overrides `Object.prototype.valueOf`. Returns [Base.id](#id).