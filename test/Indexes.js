var assert = require('chai').assert,
	config = require('./config.json'),
	neo4j = require('../lib/Neo4jApi.js');

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