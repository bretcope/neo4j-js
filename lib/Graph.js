var arguer = require('arguer');

/* ========================================================================================================
 * 
 * Graph Class
 * 
 * ===================================================================================================== */

module.exports = Graph;

function Graph (neo4j)
{
	/* ========================================================================================================
	 * 
	 * Private Members Declaration (no methods)
	 * 
	 * ===================================================================================================== */

	var _createIndexFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							   { name: 'name', type: 'string', optional: true },
							   { name: 'config', type: 'object', optional: true },
							   { name: 'callback', type: 'function' } ];
	
	var _createNodeFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							  { name: 'data', type: 'object', optional: true },
							  { name: 'callback', type: 'function' } ];
	
	var _cypherArgsFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							  { name: 'profile', type: 'boolean', optional: true },
							  { name: 'query', type: 'string' },
							  { name: 'params', type: 'object', optional: true },
							  { name: 'callback', type: 'function' } ];
	
	var _idArgsFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
						  'id',
						  { name: 'callback', type: 'function' } ];
	
	var _indexSetFormat = [ { name: 'type', type: 'string' },
							{ name: 'batch', optional: true, instance: neo4j.Api.Batch },
							{ name: 'enable' },
							{ name: 'callback', type: 'function' } ];
	
	var _indexPropertyFormat = [ { name: 'type' },
								 { name: 'add' },
								 { name: 'batch', optional: true, instance: neo4j.Api.Batch },
								 { name: 'property', type: 'string' },
								 { name: 'callback', type: 'function' } ];
	
	var _indexStatusFormat = [ { name: 'type' },
							   { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							   { name: 'callback', type: 'function' } ];
	
	var _queryArgsFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							 { name: 'index', type: 'string', optional: true },
							 'key',
							 'value',
							 { name: 'callback', type: 'function' } ];
	
	var _this = this;

	/* ========================================================================================================
	 * 
	 * Public Members Declaration (no methods)
	 * 
	 * ===================================================================================================== */
	
	this.reconnect = neo4j.Api.reconnect;

	/* ========================================================================================================
	 * 
	 * General Graph Methods
	 * 
	 * ===================================================================================================== */
	
	this.createBatch = function () { return new neo4j.Api.Batch(); };
	
	this.query = function (/* batch, profile, */ query, /* params, */ callback)
	{
		var args = arguer(arguments, _cypherArgsFormat);
		var body = { query: args.query, params: (args.params ? args.params : {}) };
		
		var endpoint = args.profile ? neo4j.Api.getEndpoint('cypher', '?profile=true') : 'cypher';
		
		new neo4j.Api.Request(args.batch, endpoint, 'POST', body, function (error, obj)
		{
			if (error)
			{
				args.callback(error);
				return;
			}
			
			//parse result set
			var c;
			var row;
			var results = [];
			var constructors = [];
			for (var r = 0; r < obj.data.length; r++)
			{
				results.push({});
				row = obj.data[r];
				
				for (c = 0; c < obj.columns.length; c++)
				{
					if (!constructors[c]) // try to determine the data type of each column, if not already determined
					{
						if (row[c] && typeof row[c] === 'object')
						{
							if (typeof row[c].self === 'string' && typeof row[c].data === 'object')
							{
								// a relationship or node
								constructors[c] = typeof row[c].start === 'string' ? neo4j.Relationship : neo4j.Node;
							}
							else if (typeof row[c].start === 'string' && typeof row[c].end === 'string' && typeof row[c].nodes === 'object')
							{
								//a path
								constructors[c] = neo4j.Path;
							}
							else
							{
								constructors[c] = null;
							}
						}
						else
						{
							constructors[c] = null;
						}
					}
					
					results[r][obj.columns[c]] = (constructors[c] && row[c]) ? new constructors[c](row[c]) : row[c];
				}
				
				if (obj.plan)
					results.plan = obj.plan;
			}
			
			args.callback(null, results);
		});
	};
	
	/* ========================================================================================================
	 * 
	 * Auto Index Methods
	 * 
	 * ===================================================================================================== */

	this.addNodeAutoIndexProperty = autoProperty.bind(this, 'node', true);
	this.addRelationshipAutoIndexProperty = autoProperty.bind(this, 'relationship', true);
	
	this.getNodeAutoIndexingStatus = autoGetStatus.bind(this, 'node');
	this.getRelationshipAutoIndexingStatus = autoGetStatus.bind(this, 'relationship');
	
	this.listNodeAutoIndexProperties = autoListProperties.bind(this, 'node');
	this.listRelationshipAutoIndexProperties = autoListProperties.bind(this, 'relationship');

	this.removeNodeAutoIndexProperty = autoProperty.bind(this, 'node', false);
	this.removeRelationshipAutoIndexProperty = autoProperty.bind(this, 'relationship', false);
	
	this.setNodeAutoIndexingStatus = autoSetStatus.bind(this, 'node');
	this.setRelationshipAutoIndexingStatus = autoSetStatus.bind(this, 'relationship');
	
	function autoGetStatus (type, batch, callback)
	{
		var args = arguer(arguments, _indexStatusFormat);
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint(args.type + '_auto', 'status'), 'GET', args.callback);
	}
	
	function autoListProperties (type, batch, callback)
	{
		var args = arguer(arguments, _indexStatusFormat);
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint(args.type + '_auto', 'properties'), 'GET', args.callback);
	}
		
	function autoProperty (type, add, batch, property, callback)
	{
		var args = arguer(arguments, _indexPropertyFormat);
		var body, endpoint;
		
		if (args.add)
		{
			body = new neo4j.Api.PreProcessedContent(args.property);
			endpoint = neo4j.Api.getEndpoint(args.type + '_auto', 'properties');
		}
		else
		{
			body = null;
			endpoint = neo4j.Api.getEndpoint(args.type + '_auto', 'properties/' + encodeURIComponent(args.property));
		}
		
		neo4j.Utils.autoBatch(args.batch, endpoint, args.add ? 'POST' : 'DELETE', body, neo4j.Utils.errorOnly(args.callback));
	}
	
	function autoSetStatus (type, batch, enable, callback)
	{
		var args = arguer(arguments, _indexSetFormat);
		args.enable = Boolean(args.enable);
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint(args.type + '_auto', 'status'), 'PUT', args.enable, neo4j.Utils.errorOnly(args.callback));
	}
	
	/* ========================================================================================================
	 * 
	 * Index Methods
	 * 
	 * ===================================================================================================== */
	
	this.createNodeIndex = function (/* batch, */ name, /* config, */ callback)
	{
		var args = arguer(arguments, _createIndexFormat);
		
		if (!args.name)
			args.name = 'node_auto_index';
		
		createIndex('node_index', args.batch, args.name, args.config, args.callback);
	};

	this.createRelationshipIndex = function (/* batch, */ name, /* config, */ callback)
	{
		var args = arguer(arguments, _createIndexFormat);
		
		if (!args.name)
			args.name = 'relationship_auto_index';
		
		createIndex('relationship_index', args.batch, args.name, args.config, args.callback);
	};
	
	function createIndex (type, batch, name, config, callback)
	{
		var body = { name: name };
		if (config)
			body.config = config;
		
		neo4j.Utils.autoBatch(batch, type, 'POST', body, neo4j.Utils.errorOnly(callback));
	}
	
	this.deleteNodeIndex = function (/* batch, */ name, callback)
	{
		var args = arguer(arguments, _createIndexFormat);
		deleteIndex('node_index', args.batch, args.name, args.callback);
	};
	
	this.deleteRelationshipIndex = function (/* batch, */ name, callback)
	{
		var args = arguer(arguments, _createIndexFormat);
		deleteIndex('relationship_index', args.batch, args.name, args.callback);
	};
	
	function deleteIndex (type, batch, name, callback)
	{
		new neo4j.Api.Request(batch, neo4j.Api.getEndpoint(type, name), 'DELETE', null, neo4j.Utils.errorOnly(callback));
	}
	
	this.listNodeIndexes = function (/* batch, */ callback)
	{
		listIndexes('node_index', arguments);
	};
	
	this.listRelationshipIndexes = function (/* batch, */ callback)
	{
		listIndexes('relationship_index', arguments);
	};
	
	function exactQuery (batch, index, key, value, callback)
	{
		var query = 'START x=' + index + '(' + key + '={val}) RETURN x';
		
		var cb = function (error, obj)
		{
			if (error)
			{
				callback(error);
			}
			else
			{
				var results = obj.map(function (e) { return e.x; });
				callback(error, results);
			}
		};
		
		var args = [ query, { val: value }, cb ];
		if (batch)
			args.unshift(batch);
		
		this.query.apply(this, args);
	}
	
	function listIndexes (type, args)
	{
		var batch = null;
		var callback = args[0];
		if (args.length > 1)
		{
			batch = callback;
			callback = args[1];
		}
		
		new neo4j.Api.Request(batch, type, 'GET', null, function (error, indexes)
		{
			if (!indexes && !error)
				indexes = {};
			
			callback(error, indexes);
		});
	}
 	
	/* ========================================================================================================
	 * 
	 * Node Methods
	 * 
	 * ===================================================================================================== */
	
	this.createNode = function (/* batch, */ data, callback)
	{
		var args = arguer(arguments, _createNodeFormat);
		neo4j.Utils.autoBatch(args.batch, 'node', 'POST', args.data, neo4j.Node.nodeCallback(args.callback));
	};
	
	this.deleteNode = function (/* batch, */ id, callback)
	{
		var args = arguer(arguments, _idArgsFormat);
		
		if (args.id instanceof Array)
		{
			for (var i in args.id)
			{
				if (args.id[i] instanceof neo4j.Node)
				{
					args.id = args.id.map(function (e) { return e instanceof neo4j.Node ? e.id : e});
					break;
				}
			}
		}
		else if (args.id instanceof neo4j.Node)
		{
			args.id = args.id.id;
		}
		
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint.bind(null, 'node'), args.id, 'DELETE', null, neo4j.Utils.errorOnly(args.callback));
	};
	
	this.getNode = function (/* batch, */ id, callback)
	{
		var args = arguer(arguments, _idArgsFormat);
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint.bind(null, 'node'), args.id, 'GET', null, neo4j.Node.nodeCallback(args.callback));
	};
	
	this.isNode = function (node) { return node instanceof neo4j.Node; };
	
	this.nodeExactQuery = function (/* batch, */ index, key, value, callback)
	{
		var args = arguer(arguments, _queryArgsFormat);
		
		if (!args.index)
			args.index = 'node_auto_index';
		
		exactQuery.call(this, args.batch, 'node:' + args.index, args.key, args.value, args.callback);
	};

	/* ========================================================================================================
	 * 
	 * Path Methods
	 * 
	 * ===================================================================================================== */
	
	this.isPath = function (path) { return path instanceof neo4j.Path; };

	/* ========================================================================================================
	 * 
	 * Relationship Methods
	 * 
	 * ===================================================================================================== */
	
	this.deleteRelationship = function (/* batch, */ id, callback)
	{
		var args = arguer(arguments, _idArgsFormat);
		
		if (args.id instanceof Array)
		{
			for (var i in args.id)
			{
				if (args.id[i] instanceof neo4j.Relationship)
				{
					args.id = args.id.map(function (e) { return e instanceof neo4j.Relationship ? e.id : e});
					break;
				}
			}
		}
		else if (args.id instanceof neo4j.Relationship)
		{
			args.id = args.id.id;
		}
		
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint.bind(null, 'relationship'), args.id, 'DELETE', null, neo4j.Utils.errorOnly(args.callback));
	};
	
	this.getRelationship = function (/* batch, */ id, callback)
	{
		var args = arguer(arguments, _idArgsFormat);
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint.bind(null, 'relationship'), args.id, 'GET', null, neo4j.Relationship.relationshipCallback(args.callback));
	};
	
	this.getRelationshipTypes = function (/* batch, */ callback)
	{
		var batch = null;
		if (arguments.length > 1)
		{
			batch = arguments[0];
			callback = arguments[1];
		}
		
		new neo4j.Api.Request(batch, neo4j.Api.getEndpoint('relationship', 'types'), 'GET', null, callback);
	};
	
	this.isRelationship = function (rel) { return rel instanceof neo4j.Relationship; };
	
	this.relationshipExactQuery = function (/* batch, */ index, key, value, callback)
	{
		var args = arguer(arguments, _queryArgsFormat);
		
		if (!args.index)
			args.index = 'relationship_auto_index';
		
		exactQuery.call(this, args.batch, 'relationship:' + args.index, args.key, args.value, args.callback);
	};
}

