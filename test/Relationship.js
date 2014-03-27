var assert = require('chai').assert,
	neo4j = require('../lib/Neo4jApi.js');

var config = require('./Helpers.js').config;

describe('Relationship', function ()
{
	neo4j.connect(config.server, function (error, graph)
	{
		describe('Graph.getRelationshipTypes', function ()
		{
			it('get a list of relationship types', function (done)
			{
				graph.getRelationshipTypes(function (error, types)
				{
					assert(!error, error);
					assert.isArray(types);
					done();
				});
			});
		});
	});
});