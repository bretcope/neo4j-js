var assert = require('chai').assert,
	config = require('./config.json'),
	neo4j = require('../lib/Neo4jApi.js'),
	Helpers = require('./Helpers.js');

describe('Node', function ()
{
	neo4j.connect(config.server, function (error, graph)
	{
		var helper = Helpers(graph);
		
		beforeEach(helper.create);
		afterEach(helper.destroy);

		/* ========================================================================================================
		 * 
		 * Create Relationships
		 * 
		 * ===================================================================================================== */
		
		describe('Node.createRelationshipFrom', function ()
		{
			it('create a relationship using a node ID', function (done)
			{
				helper.nodes[0].createRelationshipFrom(helper.nodes[1].id, 'TEST1', { mock: 'data' }, helper.relationshipCallback(done));
			});
			
			it('create a relationship without data', function (done)
			{
				helper.nodes[0].createRelationshipFrom(helper.nodes[1].id, 'TEST1', helper.relationshipCallback(done));
			});
			
			it('create a relationship without data in a batch', function (done)
			{
				var batch = graph.createBatch();
				helper.nodes[0].createRelationshipFrom(batch, helper.nodes[1].id, 'TEST1', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					helper.relationships.push(rel);
					
					assert.equal(rel.start, helper.nodes[1].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, helper.nodes[0].id, 'Incorrect to/from relationship');
				});
				helper.nodes[1].createRelationshipFrom(batch, helper.nodes[0].id, 'TEST2', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					helper.relationships.push(rel);
					
					assert.equal(rel.start, helper.nodes[0].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, helper.nodes[1].id, 'Incorrect to/from relationship');
					
					done();
				});
				batch.run();
			});
		});
		
		describe('Node.createRelationshipTo', function ()
		{
			it('create a relationship using a node ID', function (done)
			{
				helper.nodes[0].createRelationshipTo(helper.nodes[1].id, 'TEST1', { mock: 'data' }, helper.relationshipCallback(done));
			});
			
			it('create a relationship without data', function (done)
			{
				helper.nodes[0].createRelationshipTo(helper.nodes[1].id, 'TEST1', helper.relationshipCallback(done));
			});
			
			it('create a relationship without data in a batch', function (done)
			{
				var batch = graph.createBatch();
				helper.nodes[0].createRelationshipTo(batch, helper.nodes[1].id, 'TEST1', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					helper.relationships.push(rel);
					
					assert.equal(rel.start, helper.nodes[0].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, helper.nodes[1].id, 'Incorrect to/from relationship');
				});
				helper.nodes[1].createRelationshipTo(batch, helper.nodes[0].id, 'TEST2', function (error, rel)
				{
					assert(!error, error);
					assert(graph.isRelationship(rel), 'expected relationship to be returned to callback');
					
					helper.relationships.push(rel);
					
					assert.equal(rel.start, helper.nodes[1].id, 'Incorrect to/from relationship');
					assert.equal(rel.end, helper.nodes[0].id, 'Incorrect to/from relationship');
					
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
				helper.nodes[0].getAllRelationships(relationshipChecks(2, null, done));
			});
			
			it('work with batching', function (done)
			{
				var batch = graph.createBatch();
				
				helper.nodes[0].getAllRelationships(batch, relationshipChecks(2));
				helper.nodes[1].getAllRelationships(batch, relationshipChecks(2, null, done));
				
				batch.run();
			});
			
			it('filter relationships by type', function (done)
			{
				helper.nodes[0].getAllRelationships('TEST1', relationshipChecks(1, ['TEST1'], done));
			});
			
			it('filter relationships by multiple types', function (done)
			{
				var filter = [ 'TEST1', 'TEST3', 'TEST2' ];
				helper.nodes[0].getAllRelationships(filter, relationshipChecks(2, filter, done));
			});
			
			it('filter relationships by multiple types in a batch', function (done)
			{
				var filter = [ 'TEST1', 'TEST3', 'TEST2' ];
				var batch = graph.createBatch();
				helper.nodes[0].getAllRelationships(batch, filter, relationshipChecks(2, filter));
				helper.nodes[1].getAllRelationships(batch, filter, relationshipChecks(2, filter, done));
				batch.run();
			});
		});
		
		describe('Node.getIncomingRelationships', function ()
		{
			it('return only incoming relationships', function (done)
			{
				helper.nodes[0].getIncomingRelationships(relationshipChecks(1, null, done, function (rel)
				{
					assert.equal(rel.end, helper.nodes[0], 'wrong directional relationship');
				}));
			});
		});
		
		describe('Node.getOutgoingRelationships', function ()
		{
			it('return only outgoing relationships', function (done)
			{
				helper.nodes[0].getOutgoingRelationships(relationshipChecks(1, null, done, function (rel)
				{
					assert.equal(rel.start, helper.nodes[0], 'wrong directional relationship');
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
				assert.deepEqual(props, expected, 'properties are incorrect');
				
				if (done)
					done();
			};
		}
		
		describe('Node.refreshProperties', function ()
		{
			it("return the node's properties", function (done)
			{
				var origProps = helper.nodes[0].data;
				helper.nodes[0].refreshProperties(propertiesCheck(origProps, done));
			});
		});
		
		describe('Node.deleteProperties', function ()
		{
			it("delete the 'c' property", function (done)
			{
				var props = helper.sampleNodeData();
				delete props.c;
				
				helper.nodes[0].deleteProperties('c', propertiesCheck(props, done));
			});
			
			it("delete 'a' and 'c' using batching", function (done)
			{
				var props = helper.sampleNodeData();
				delete props.c;
				delete props.a;
				
				var batch = graph.createBatch();
				
				helper.nodes[0].deleteProperties(batch, false, 'a', function (error, nothing)
				{
					assert(!error, error);
					assert.isUndefined(nothing, 'deleteProperties returned a second parameter even though updateData was false');
				});
				
				helper.nodes[0].deleteProperties(batch, 'c', propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("delete 'a' and 'c' using auto-batching", function (done)
			{
				var props = helper.sampleNodeData();
				delete props.c;
				delete props.a;
				
				helper.nodes[0].deleteProperties(['c', 'a'], propertiesCheck(props, done));
			});
			
			it("delete all properties", function (done)
			{
				helper.nodes[0].deleteProperties(propertiesCheck({}, done));
			});
			
			it("delete all properties using batching", function (done)
			{
				var batch = graph.createBatch();
				
				helper.nodes[0].deleteProperties(propertiesCheck({}));
				helper.nodes[1].deleteProperties(propertiesCheck({}, done));
				
				batch.run();
			});
		});
		
		describe('Node.replaceAllProperties', function ()
		{
			it("replace all properties", function (done)
			{
				var props = { str: 'new', bool: false, arr: [2,3], num: 18 };
				helper.nodes[0].replaceAllProperties(props, propertiesCheck(props, done));
			});
			
			it("replace all properties on multiple nodes using batching", function (done)
			{
				var props = { str: 'new', bool: false, arr: [2,3], num: 18 };
				var batch = graph.createBatch();
				
				helper.nodes[0].replaceAllProperties(batch, props, propertiesCheck(props));
				helper.nodes[1].replaceAllProperties(batch, props, propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("replace all properties with a single boolean property", function (done)
			{
				var props = { bool: false };
				helper.nodes[0].replaceAllProperties('bool', false, propertiesCheck(props, done));
			});
			
			it("replace all properties with a single array property", function (done)
			{
				var props = { arr: [2,3,7] };
				helper.nodes[0].replaceAllProperties('arr', [2,3,7], propertiesCheck(props, done));
			});
			
			it("replace all properties with a single property using batching", function (done)
			{
				var props = { bool: false };
				var batch = graph.createBatch();
				
				helper.nodes[0].replaceAllProperties(batch, 'bool', false, propertiesCheck(props));
				helper.nodes[1].replaceAllProperties(batch, 'bool', false, propertiesCheck(props, done));
				
				batch.run();
			});
		});
		
		describe('Node.setProperties', function ()
		{
			it("update a single property", function (done)
			{
				var props = helper.sampleNodeData();
				props.b = 'three';
				
				helper.nodes[0].setProperty('b', 'three', propertiesCheck(props, done));
			});
			
			it("update a single property on multiple nodes using batching", function (done)
			{
				var batch = graph.createBatch();
				var props = helper.sampleNodeData();
				props.b = false;
				
				helper.nodes[0].setProperty(batch, 'b', false, propertiesCheck(props));
				helper.nodes[1].setProperty(batch, 'b', false, propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("update a multiple properties using batching", function (done)
			{
				var batch = graph.createBatch();
				var props = helper.sampleNodeData();
				props.b = false;
				props.c = [84, 23];
				
				helper.nodes[0].setProperty(batch, false, 'b', props.b, function (error, nothing)
				{
					assert(!error, error);
					assert.isUndefined(nothing, 'setProperty returned a second parameter even though updateData was false');
				});
				
				helper.nodes[0].setProperty(batch, 'c', props.c, propertiesCheck(props, done));
				
				batch.run();
			});
			
			it("update a multiple properties using auto-batching", function (done)
			{
				var props = helper.sampleNodeData();
				props.b = false;
				props.c = [84, 23];
				
				helper.nodes[0].setProperties(props, propertiesCheck(props, done));
			});
		});
	});
});