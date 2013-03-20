var assert = require('chai').assert;

module.exports = function (graph)
{
	var _public = {};
	
	var _nodes = [];
	var _relationships = [];
	
	function relationshipCallback (callback, count)
	{
		if (!count)
			count = 1;
		
		var returned = 0;
		return function (error, rel)
		{
			assert(!error, error);
			assert(graph.isRelationship(rel), 'Error creating relationships.');
			
			_relationships.push(rel);
			
			if (++returned == count)
				callback();
		};
	}
	
	function sampleNodeData ()
	{
		return { a:1, b:'two', c: [3, 4, 5], d: false };
	}
	
	function create (callback)
	{
		var count = 0;
		var sample = sampleNodeData();
		graph.createNode([ sample, sample ], function (error, nodes)
		{
			assert(!error, 'Error creating nodes.');
			assert.isArray(nodes, 'Expected two nodes to be created.');
			assert.equal(nodes.length, 2, 'Expected two nodes to be created.');
			
			_nodes.push(nodes[0], nodes[1]);
			
			var batch = graph.createBatch();
			var cb = relationshipCallback(callback, 2);
			nodes[0].createRelationshipTo(batch, nodes[1], 'TEST1', { x:0, y:'z' }, cb);
			nodes[0].createRelationshipFrom(batch, nodes[1], 'TEST2', { x:1, z:'y' }, cb);
			
			batch.run();
		});
	}
	
	function destroy (done)
	{
		var count = 0;
		var batch = graph.createBatch();
		
		if (_relationships.length)
			graph.deleteRelationship(batch, _relationships, cb);
		
		if (_nodes.length)
			graph.deleteNode(batch, _nodes, done);
		
		_public.nodes = _nodes = [];
		_public.relationships = _relationships = [];
		
		if (batch.requests.length)
			batch.run();
		else
			done();
		
		function cb (error)
		{
			assert(!error, error);
			
			if (++count == batch.requests.length)
				done();
		}
	}
	
	_public.nodes = _nodes;
	_public.relationships = _relationships;
	_public.relationshipCallback = relationshipCallback;
	_public.sampleNodeData = sampleNodeData;
	_public.create = create;
	_public.destroy = destroy;
	
	return _public;
};