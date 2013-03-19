var assert = require('chai').assert,
	config = require('./config.json'),
	neo4j = require('../lib/Neo4jApi.js');

describe('Node', function ()
{
	neo4j.connect(config.server, function (error, graph)
	{
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
		
		function create (callback)
		{
			var count = 0;
			var sample = { a:1, b:'two', c: [3, 4, 5], d: false };
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
		
		beforeEach(function (done)
		{
			create(done);
		});
		
		afterEach(function (done)
		{
			var count = 0;
			var batch = graph.createBatch();
			
			if (_relationships.length)
				graph.deleteRelationship(batch, _relationships, cb);
			
			if (_nodes.length)
				graph.deleteNode(batch, _nodes, done);
			
			_nodes = [];
			_relationships = [];
			
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
		});
		
		describe('Node.createRelationshipFrom', function ()
		{
			it('should create a relationship using a node ID', function (done)
			{
				_nodes[0].createRelationshipFrom(_nodes[1].id, 'TEST1', { mock: 'data' }, relationshipCallback(done));
			});
			
			it('should create a relationship without data', function (done)
			{
				_nodes[0].createRelationshipFrom(_nodes[1].id, 'TEST1', relationshipCallback(done));
			});
			
			it('should create a relationship without data in a batch', function (done)
			{
				var batch = graph.createBatch();
				_nodes[0].createRelationshipFrom(batch, _nodes[1].id, 'TEST1', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					_relationships.push(rel);
					
					assert.equal(rel.start, _nodes[1].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, _nodes[0].id, 'Incorrect to/from relationship');
				});
				_nodes[1].createRelationshipFrom(batch, _nodes[0].id, 'TEST2', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					_relationships.push(rel);
					
					assert.equal(rel.start, _nodes[0].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, _nodes[1].id, 'Incorrect to/from relationship');
					
					done();
				});
				batch.run();
			});
		});
		
		describe('Node.createRelationshipTo', function ()
		{
			it('should create a relationship using a node ID', function (done)
			{
				_nodes[0].createRelationshipTo(_nodes[1].id, 'TEST1', { mock: 'data' }, relationshipCallback(done));
			});
			
			it('should create a relationship without data', function (done)
			{
				_nodes[0].createRelationshipTo(_nodes[1].id, 'TEST1', relationshipCallback(done));
			});
			
			it('should create a relationship without data in a batch', function (done)
			{
				var batch = graph.createBatch();
				_nodes[0].createRelationshipTo(batch, _nodes[1].id, 'TEST1', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					_relationships.push(rel);
					
					assert.equal(rel.start, _nodes[0].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, _nodes[1].id, 'Incorrect to/from relationship');
				});
				_nodes[1].createRelationshipTo(batch, _nodes[0].id, 'TEST2', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					_relationships.push(rel);
					
					assert.equal(rel.start, _nodes[1].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, _nodes[0].id, 'Incorrect to/from relationship');
					
					done();
				});
				batch.run();
			});
		});
		
		describe('Node.getAllRelationships', function ()
		{
			it('should return relationships from both directions', function (done)
			{
				_nodes[0].getAllRelationships(relationshipChecks(2, null, done));
			});
			
			it('should work with batching', function (done)
			{
				var batch = graph.createBatch();
				
				_nodes[0].getAllRelationships(batch, relationshipChecks(2));
				_nodes[1].getAllRelationships(batch, relationshipChecks(2, null, done));
				
				batch.run();
			});
			
			it('should filter relationships by type', function (done)
			{
				_nodes[0].getAllRelationships('TEST1', relationshipChecks(1, ['TEST1'], done));
			});
			
			it('should filter relationships by multiple types', function (done)
			{
				var filter = [ 'TEST1', 'TEST3', 'TEST2' ];
				_nodes[0].getAllRelationships(filter, relationshipChecks(2, filter, done));
			});
			
			it('should filter relationships by multiple types in a batch', function (done)
			{
				var filter = [ 'TEST1', 'TEST3', 'TEST2' ];
				var batch = graph.createBatch();
				_nodes[0].getAllRelationships(batch, filter, relationshipChecks(2, filter));
				_nodes[1].getAllRelationships(batch, filter, relationshipChecks(2, filter, done));
				batch.run();
			});
		});
		
		describe('Node.getIncomingRelationships', function ()
		{
			it('should return only incoming relationships', function (done)
			{
				_nodes[0].getIncomingRelationships(relationshipChecks(1, null, done, function (rel)
				{
					assert.equal(rel.end, _nodes[0], 'wrong directional relationship');
				}));
			});
		});
		
		describe('Node.getOutgoingRelationships', function ()
		{
			it('should return only outgoing relationships', function (done)
			{
				_nodes[0].getOutgoingRelationships(relationshipChecks(1, null, done, function (rel)
				{
					assert.equal(rel.start, _nodes[0], 'wrong directional relationship');
				}));
			});
		});
		
		function relationshipChecks (expectedResults, filter, done, extraCheck)
		{
			return function (error, rels)
			{
				assert(!error, error);
				assert.isArray(rels, 'expected an array');
				assert.equal(rels.length, expectedResults, 'expected array of length ' + expectedResults);
				
				for (var i in rels)
				{
					assert(graph.isRelationship(rels[i]), 'expected all elements to be instances of Relationship');
					
					if (filter)
						assert(filter.indexOf(rels[i].type) != -1, 'results were not filtered by type correctly');
					
					if (extraCheck)
						extraCheck(rels[i]);
				}
				
				if (done)
					done();
			};
		}
	});
});