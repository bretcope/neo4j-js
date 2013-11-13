
var arguer = require('arguer');
var Url = require('url');

module.exports = function (neo4j)
{
	/* ========================================================================================================
	 * 
	 * Private Members Declaration (no methods)
	 * 
	 * ===================================================================================================== */
	
 	var _deletePropsFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							   { name: 'updateData', type: 'boolean', optional: true },
							   { name: 'props', nType: 'function', optional: true },
							   { name: 'callback', type: 'function', optional: true } ];
	
	var _indexFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
						 { name: 'index', type: 'string' },
						 { name: 'key', type: 'string', optional: true },
						 { name: 'value', requires: 'key' },
						 { name: 'props', type: 'object', mutex: 'key' },
						 { name: 'callback', type: 'function' } ];
	
	var _refreshFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
						   { name: 'updateData', type: 'boolean', optional: true },
						   { name: 'callback', type: 'function', optional: true } ];
	
	var _setPropsFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
						    { name: 'updateData', type: 'boolean', optional: true },
						    { name: 'key', type: 'string', optional: true },
						    { name: 'value', requires: 'key', requiredBy: 'key' },
						    { name: 'props', type: 'object', mutex: 'key' },
						    { name: 'callback', type: 'function' } ];

	/* ========================================================================================================
	 * 
	 * Base Class - Provides a common inheritance for nodes and relationships
	 * 
	 * ===================================================================================================== */
	
	function Base (obj)
	{
		this.id = neo4j.Utils.parseId(obj.self);
		this.data = obj.data;
		Object.freeze(this.data); // being able to edit data would give the false impression that the node/relationship can be updated in that fashion
		
		Object.freeze(obj);
		Object.defineProperty(this, '_obj', { value: obj, enumerable: false, writable: false });
	}

	/* ========================================================================================================
	 * 
	 * Public Methods - Keep in alphabetical order
	 * 
	 * ===================================================================================================== */
	
	Base.prototype.deleteProperties = function (/* batch, */ props, callback)
	{
		var args = arguer(arguments, _deletePropsFormat);
		if (!args.callback)
			args.callback = emptyCallback;
		
		if (args.props === undefined)
			args.props = ''; //causes all properties to be deleted
		
		var batch = !args.batch && args.updateData !== false ? new neo4j.Api.Batch() : args.batch;
		var cb = args.updateData === false ? neo4j.Utils.errorOnly(args.callback) : emptyCallback;
		neo4j.Utils.autoBatch(batch, neo4j.Api.getEndpoint.bind(null, Url.parse(this._obj.properties)), args.props, 'DELETE', null, cb);
		
		if (args.updateData !== false)
		{
			this.refreshProperties(batch, args.callback);
			
			if (!args.batch)
				batch.run(args.callback);
		}
	};
	
	Base.prototype.index = function (/* batch, */ index, key, value, callback)
	{
		var args = arguer(arguments, _indexFormat);
		
		var data;
		if (args.props)
		{
			data = [];
			for (var i in args.props)
			{
				data.push({ uri: this._obj.self, key: i, value: args.props[i] });
			}
		}
		else
		{
			data = { uri: this._obj.self, key: args.key, value: args.value };
		}
		
		var endpoint = this instanceof neo4j.Node ? 'node_index' : 'relationship_index';
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint(endpoint, args.index), 'POST', data, neo4j.Utils.errorOnly(args.callback));
	};
	
	Base.prototype.refreshProperties = function (/* batch, */ callback)
	{
		var args = arguer(arguments, _refreshFormat);
		var _this = this;
		new neo4j.Api.Request(args.batch, Url.parse(this._obj.properties), 'GET', null, function (error, obj)
		{
			if (!error)
				_this.data = obj ? obj : {}; // when all properties have been deleted, obj seems to end up as null.
			
			Object.freeze(_this.data);
			
			if (args.callback)
				args.callback(error, _this.data);
		});
	};
	
	Base.prototype.removeFromIndex = function (/* batch, */ index, callback)
	{
		var args = arguer(arguments, _indexFormat);
		
		var endpoints;
		
		if (args.props)
		{
			endpoints = [];
			var ep;
			
			for (var i in args.props)
			{
				ep = args.index + '/';
				
				if (args.props instanceof Array) // array of key names
				{
					ep += args.props[i] + '/';
				}
				else // object representing multiple keys and values, although values of null or undefined are ignored.
				{
					ep += i + '/';
					
					if (args.props[i] !== null && args.props[i] !== null)
						ep += encodeURIComponent(args.props[i] + '') + '/';
				}
				
				ep += this.id;
				endpoints.push(ep);
			}
		}
		else
		{
			endpoints = args.index + '/';
			
			if (args.key) // one key, and possibly a value
			{
				endpoints += args.key + '/';
				
				if (args.value !== undefined)
					endpoints += encodeURIComponent(args.value + '') + '/';
			}
			
			endpoints += this.id;
		}
		
		var baseEndpoint = this instanceof neo4j.Node ? 'node_index' : 'relationship_index';
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint.bind(null, baseEndpoint), endpoints, 'DELETE', null, args.callback);
	};
	
	Base.prototype.replaceAllProperties = function (/* batch, */ props, callback)
	{
		var args = arguer(arguments, _setPropsFormat);
		
		if (args.key)
		{
			args.props = {};
			args.props[args.key] = args.value;
		}
		
		var batch = !args.batch && args.updateData !== false ? new neo4j.Api.Batch() : args.batch;
		var cb = args.updateData === false ? neo4j.Utils.errorOnly(args.callback) : emptyCallback;
		neo4j.Utils.autoBatch(batch, Url.parse(this._obj.properties), 'PUT', args.props, cb);
		
		if (args.updateData !== false)
		{
			this.refreshProperties(batch, args.callback);
			
			if (!args.batch)
				batch.run(args.callback);
		}
	};
	
	Base.prototype.setProperties = function (/* batch, */ props, callback)
	{
		var args = arguer(arguments, _setPropsFormat);
		
		if (args.props)
		{
			args.key = [];
			args.value = [];
			
			for (var i in args.props)
			{
				args.key.push(i);
				args.value.push(args.props[i]);
			}
		}
		else if (args.value instanceof Array) // this is a special case. Passing an array as the data would be ambiguous, so we must put it inside a wrapper array
		{
			args.value = [ args.value ];
		}
		
		var batch = !args.batch && args.updateData !== false ? new neo4j.Api.Batch() : args.batch;
		var cb = args.updateData === false ? neo4j.Utils.errorOnly(args.callback) : emptyCallback;
		neo4j.Utils.autoBatch(batch, neo4j.Api.getEndpoint.bind(null, Url.parse(this._obj.properties)), args.key, 'PUT', args.value, cb);
		
		if (args.updateData !== false)
		{
			this.refreshProperties(batch, args.callback);
			
			if (!args.batch)
				batch.run(args.callback);
		}
	};
	
	Base.prototype.setProperty = Base.prototype.setProperties;
	
	Base.prototype.valueOf = function () { return this.id; };
	
	function emptyCallback () {}
	
	return Base;
};
