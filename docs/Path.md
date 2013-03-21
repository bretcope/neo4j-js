[« Documentation Home](Documentation.md)

# Path Class

`Path` objects represent a neo4j path.

> This class is incomplete. It will likely have more methods/properties in the near future.

**[Properties](#properties)**

* [end](#end)
* [length](#length)
* [start](#start)

**[Methods](#methods)**

* None as of yet.

## Constructor

Currently, `Path` objects are only returned in the results of certain [Cypher queries](Graph.md#query), although they will eventually see more usage.

## Properties

### end

```scala
(String) Path.end
```

Represents the ID of the end Node.

### length

```scala
(Number) Path.length
```

The length of the path.

### start

```scala
(String) Path.start
```

Represents the ID of the start Node.

## Methods

None as of yet.