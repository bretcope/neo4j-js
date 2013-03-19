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

		/* ========================================================================================================
		 * 
		 * Create Relationships
		 * 
		 * ===================================================================================================== */
		
		describe('Node.createRelationshipFrom', function ()
		{
			it('create a relationship using a node ID', function (done)
			{
				_nodes[0].createRelationshipFrom(_nodes[1].id, 'TEST1', { mock: 'data' }, relationshipCallback(done));
			});
			
			it('create a relationship without data', function (done)
			{
				_nodes[0].createRelationshipFrom(_nodes[1].id, 'TEST1', relationshipCallback(done));
			});
			
			it('create a relationship without data in a batch', function (done)
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
			it('create a relationship using a node ID', function (done)
			{
				_nodes[0].createRelationshipTo(_nodes[1].id, 'TEST1', { mock: 'data' }, relationshipCallback(done));
			});
			
			it('create a relationship without data', function (done)
			{
				_nodes[0].createRelationshipTo(_nodes[1].id, 'TEST1', relationshipCallback(done));
			});
			
			it('create a relationship without data in a batch', function (done)
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

		/* ========================================================================================================
		 * 
		 * Get Relationships
		 * 
		 * ===================================================================================================== */
		
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
		
		describe('Node.getAllRelationships', function ()
		{
			it('return relationships from both directions', function (done)
			{
				_nodes[0].getAllRelationships(relationshipChecks(2, null, done));
			});
			
			it('work with batching', function (done)
			{
				var batch = graph.createBatch();
				
				_nodes[0].getAllRelationships(batch, relationshipChecks(2));
				_nodes[1].getAllRelationships(batch, relationshipChecks(2, null, done));
				
				batch.run();
			});
			
			it('filter relationships by type', function (done)
			{
				_nodes[0].getAllRelationships('TEST1', relationshipChecks(1, ['TEST1'], done));
			});
			
			it('filter relationships by multiple types', function (done)
			{
				var filter = [ 'TEST1', 'TEST3', 'TEST2' ];
				_nodes[0].getAllRelationships(filter, relationshipChecks(2, filter, done));
			});
			
			it('filter relationships by multiple types in a batch', function (done)
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
			it('return only incoming relationships', function (done)
			{
				_nodes[0].getIncomingRelationships(relationshipChecks(1, null, done, function (rel)
				{
					assert.equal(rel.end, _nodes[0], 'wrong directional relationship');
				}));
			});
		});
		
		describe('Node.getOutgoingRelationships', function ()
		{
			it('return only outgoing relationships', function (done)
			{
				_nodes[0].getOutgoingRelationships(relationshipChecks(1, null, done, function (rel)
				{
					assert.equal(rel.start, _nodes[0], 'wrong directional relationship');
				}));
			});
		});

		/* ========================================================================================================
		 * 
		 * Properties
		 * 
		 * ===================================================================================================== */
		
		function propertiesCheck (expected, done)
		{
			return function (error, props)
			{
				assert(!error, error);
				assert.deepEqual(expected, props, 'properties are incorrect');
				
				if (done)
					done();
			};
		}
		
		describe('Node.refreshProperties', function ()
		{
			it("return the node's properties", function (done)
			{
				var origProps = _nodes[0].data;
				_nodes[0].refreshProperties(propertiesCheck(origProps, done));
			});
		});
		
		describe('Node.deleteProperties', function ()
		{
			it("delete the 'c' property", function (done)
			{
				var props = sampleNodeData();
				delete props.c;
				
				_nodes[0].deleteProperties('c', propertiesCheck(props, done));
			});
			
			it("delete 'a' and 'c' using batching", function (done)
			{
				var props = sampleNodeData();
				delete props.c;
				delete props.a;
				
				var batch = graph.createBatch();
				
				_nodes[0].deleteProperties(batch, false, 'a', function (error, nothing)
				{
					assert(!error, error);
					assert.isUndefined(nothing, 'deleteProperties returned a second parameter even though updateData was false');
				});
				
				_nodes[0].deleteProperties(batch, 'c', propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("delete 'a' and 'c' using auto-batching", function (done)
			{
				var props = sampleNodeData();
				delete props.c;
				delete props.a;
				
				_nodes[0].deleteProperties(['c', 'a'], propertiesCheck(props, done));
			});
			
			it("delete all properties", function (done)
			{
				_nodes[0].deleteProperties(propertiesCheck({}, done));
			});
			
			it("delete all properties using batching", function (done)
			{
				var batch = graph.createBatch();
				
				_nodes[0].deleteProperties(propertiesCheck({}));
				_nodes[1].deleteProperties(propertiesCheck({}, done));
				
				batch.run();
			});
		});
		
		describe('Node.replaceAllProperties', function ()
		{
			it("replace all properties", function (done)
			{
				var props = { str: 'new', bool: false, arr: [2,3], num: 18 };
				_nodes[0].replaceAllProperties(props, propertiesCheck(props, done));
			});
			
			it("replace all properties on multiple nodes using batching", function (done)
			{
				var props = { str: 'new', bool: false, arr: [2,3], num: 18 };
				var batch = graph.createBatch();
				
				_nodes[0].replaceAllProperties(batch, props, propertiesCheck(props));
				_nodes[1].replaceAllProperties(batch, props, propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("replace all properties with a single boolean property", function (done)
			{
				var props = { bool: false };
				_nodes[0].replaceAllProperties('bool', false, propertiesCheck(props, done));
			});
			
			it("replace all properties with a single array property", function (done)
			{
				var props = { arr: [2,3,7] };
				_nodes[0].replaceAllProperties('arr', [2,3,7], propertiesCheck(props, done));
			});
			
			it("replace all properties with a single property using batching", function (done)
			{
				var props = { bool: false };
				var batch = graph.createBatch();
				
				_nodes[0].replaceAllProperties(batch, 'bool', false, propertiesCheck(props));
				_nodes[1].replaceAllProperties(batch, 'bool', false, propertiesCheck(props, done));
				
				batch.run();
			});
		});
		
		describe('Node.setProperties', function ()
		{
			it("update a single property", function (done)
			{
				var props = sampleNodeData();
				props.b = 'three';
				
				_nodes[0].setProperty('b', 'three', propertiesCheck(props, done));
			});
			
			it("update a single property on multiple nodes using batching", function (done)
			{
				var batch = graph.createBatch();
				var props = sampleNodeData();
				props.b = false;
				
				_nodes[0].setProperty(batch, 'b', false, propertiesCheck(props));
				_nodes[1].setProperty(batch, 'b', false, propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("update a multiple properties using batching", function (done)
			{
				var batch = graph.createBatch();
				var props = sampleNodeData();
				props.b = false;
				props.c = [84, 23];
				
				_nodes[0].setProperty(batch, false, 'b', props.b, function (error, nothing)
				{
					assert(!error, error);
					assert.isUndefined(nothing, 'setProperty returned a second parameter even though updateData was false');
				});
				
				_nodes[0].setProperty(batch, 'c', props.c, propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("update a multiple properties using auto-batching", function (done)
			{
				var props = sampleNodeData();
				props.b = false;
				props.c = [84, 23];
				
				_nodes[0].setProperties(props, propertiesCheck(props, done));
			});
		});
	});
});