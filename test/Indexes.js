var assert = require('chai').assert,
	config = require('./config.json'),
	neo4j = require('../lib/Neo4jApi.js'),
	Helpers = require('./Helpers.js');

describe('Indexes', function ()
{
	neo4j.connect(config.server, function (error, graph)
	{
		var _nodeIndexes = [];
		var _relIndexes = [];
		
		describe('Graph.createNodeIndex', function ()
		{
			it('create a node index with the default config', function (done)
			{
				graph.createNodeIndex('node_test_1', function (error)
				{
					assert(!error, error);
					_nodeIndexes.push('node_test_1');
					done();
				});
			});
			
			it('create a node index custom default config', function (done)
			{
				var config = { type: 'fulltext', provider: 'lucene' };
				graph.createNodeIndex('node_test_2', config, function (error)
				{
					assert(!error, error);
					_nodeIndexes.push('node_test_2');
					done();
				});
			});
		});
		
		describe('Graph.createRelationshipIndex', function ()
		{
			it('create a relationship index with the default config', function (done)
			{
				graph.createRelationshipIndex('rel_test_1', function (error)
				{
					assert(!error, error);
					_relIndexes.push('rel_test_1');
					done();
				});
			});
			
			it('create a node index custom default config', function (done)
			{
				var config = { type: 'fulltext', provider: 'lucene' };
				graph.createRelationshipIndex('rel_test_2', config, function (error)
				{
					assert(!error, error);
					_relIndexes.push('rel_test_2');
					done();
				});
			});
		});
		
		function verifyList (list, done)
		{
			return function (error, indexes)
			{
				assert(!error, error);
				
				for (var i in list)
				{
					assert.property(indexes, list[i], 'Expected property ' + list[i] + '. Either create or list is broken.');
					
					if (/_test_2$/.test(list[i]))
						assert(indexes[list[i]], 'fulltext', 'Incorrect type. Custom config is broken');
				}
				
				done();
			};
		}
		
		describe('Graph.listNodeIndexes', function ()
		{
			it('list node indexes', function (done)
			{
				this.timeout(10000);
				graph.listNodeIndexes(verifyList(_nodeIndexes, done));
			});
		});
		
		describe('Graph.listRelationshipIndexes', function ()
		{
			it('list relationship indexes', function (done)
			{
				this.timeout(10000);
				graph.listRelationshipIndexes(verifyList(_relIndexes, done));
			});
		});
		
		function verifyDelete (type, done)
		{
			var count = 0;
			
			var deleteFunction;
			var listFunction;
			var list;
			if (type == 'node')
			{
				deleteFunction = 'deleteNodeIndex';
				listFunction = 'listNodeIndexes';
				list = _nodeIndexes;
			}
			else
			{
				deleteFunction = 'deleteRelationshipIndex';
				listFunction = 'listRelationshipIndexes';
				list = _relIndexes;
			}
			
			var cb = function (error)
			{
				assert(!error, error);
				
				if (++count < list.length)
					return;
				
				graph[listFunction](function (error, indexes)
				{
					assert(!error, error);
					
					var p;
					while (p = list.pop())
					{
						assert.notProperty(indexes, p, 'Delete failed. Index still exists.');
					}
					
					done();
				});
			};
			
			//perform delete
			var batch = graph.createBatch();
			
			for (var i in list)
				graph[deleteFunction](batch, list[i], cb);
			
			batch.run();
		}
		
		describe('Index Usage', function ()
		{
			var helper = Helpers(graph);
			
			before(helper.create);
			after(helper.destroy);
			
			var _vals = ['test node value', 'different value', 'test rel value'];
			
			describe('Node.index', function ()
			{
				it('add a property to an index', function (done)
				{
					helper.nodes[0].index('node_test_1', 'name', _vals[0], function (error)
					{
						assert(!error, error);
						done();
					});
				});
				
				it('add another node to the same index', function (done)
				{
					helper.nodes[1].index('node_test_1', 'name', _vals[1], function (error)
					{
						assert(!error, error);
						done();
					});
				});
			});
			
			describe('Relationship.index', function ()
			{
				it('add a property to an index', function (done)
				{
					helper.relationships[0].index('rel_test_1', 'name', _vals[2], function (error)
					{
						assert(!error, error);
						done();
					});
				});
			});
			
			describe('Graph.nodeExactQuery', function ()
			{
				it('extract a node from the index', function (done)
				{
					graph.nodeExactQuery('node_test_1', 'name', _vals[0], function (error, nodes)
					{
						assert(!error, error);
						assert.isArray(nodes, 'expected result to be an array');
						assert.equal(nodes.length, 1, 'expected an array of length 1');
						assert.equal(nodes[0], helper.nodes[0].id, 'return results were incorrect');
						done();
					});
				});
			});
			
			describe('Graph.relationshipExactQuery', function ()
			{
				it('extract a node from the index', function (done)
				{
					graph.relationshipExactQuery('rel_test_1', 'name', _vals[2], function (error, relationships)
					{
						assert(!error, error);
						assert.isArray(relationships, 'expected result to be an array');
						assert.equal(relationships.length, 1, 'expected an array of length 1');
						assert.equal(relationships[0], helper.relationships[0].id, 'return results were incorrect');
						done();
					});
				});
			});
			
			function verifyRemoved (done)
			{
				return function (error, nodes)
				{
					assert(!error, error);
					assert.isArray(nodes, 'expected an empty array');
					assert.equal(nodes.length, 0, 'expected an empty array');
					done();
				};
			}
			
			describe('Node.removeFromIndex', function ()
			{
				it('remove node from index', function (done)
				{
					helper.nodes[0].removeFromIndex('node_test_1', function (error)
					{
						assert(!error, error);
						graph.nodeExactQuery('node_test_1', 'name', _vals[0], verifyRemoved(done));
					});
				});
				
				it('remove node from index specifying a key', function (done)
				{
					helper.nodes[1].removeFromIndex('node_test_1', 'name', function (error)
					{
						assert(!error, error);
						graph.nodeExactQuery('node_test_1', 'name', _vals[1], verifyRemoved(done));
					});
				});
			});
			
			describe('Relationship.removeFromIndex', function ()
			{
				it('remove relationship from index specifying a key and value', function (done)
				{
					helper.relationships[0].removeFromIndex('rel_test_1', 'name', _vals[2], function (error)
					{
						assert(!error, error);
						graph.relationshipExactQuery('rel_test_1', 'name', _vals[2], verifyRemoved(done));
					});
				});
			});
		});
		
		describe('Graph.deleteNodeIndex', function ()
		{
			it('delete all test node indexes', function (done)
			{
				this.timeout(10000);
				verifyDelete('node', done);
			});
		});
		
		describe('Graph.deleteRelationshipIndex', function ()
		{
			it('delete all test relationship indexes', function (done)
			{
				this.timeout(10000);
				verifyDelete('relationship', done);
			});
		});
	});
});