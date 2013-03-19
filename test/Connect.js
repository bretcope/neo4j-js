var assert = require('chai').assert,
	config = require('./config.json'),
	neo4j = require('../lib/Neo4jApi.js');

describe('Connect', function ()
{
	it('should connect to host', function (done)
	{
		neo4j.connect(config.server, done);
	});
});