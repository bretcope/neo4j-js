[« Documentation Home](Documentation.md)

# Batch Class

`Batch` objects facilitate grouping multiple API calls into a single batch request. Most library methods accept a `Batch` object as an optional first parameter.

**[Properties](#properties)**

* [requests](#requests)

**[Methods](#methods)**

* [run](#run)

## Constructor

`Batch` objects are instantiated using [Graph.createBatch](Graph.md#createbatch).

```javascript
var batch = graph.createBatch();
```

## Properties

### requests

```scala
Array Batch.requests
```

An array of the batched requests. It is used internally by library methods, and it should be not be necessary to edit manually. **NEVER** reassign this property. For example: `batch.requests = [];` will break the batch system.  

## Methods

### run

```scala
Batch.run ( )
Batch.run ( Function errorHandler )
```

Runs all requests associated with the `Batch` object in a single API request.

`errorHandler`
* If provided, this function will be called in case of an error. If no error handler is provided, callbacks associated with each individual request will all be called with the error. 
Signature: `Function ( error )`
