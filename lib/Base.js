
var Url = require('url');

/* ========================================================================================================
 * 
 * Private Members Declaration (no methods)
 * 
 * ===================================================================================================== */

// code

/* ========================================================================================================
 * 
 * Public Members Declaration (no methods)
 * 
 * ===================================================================================================== */

// code

/* ========================================================================================================
 * 
 * Public Methods - Keep in alphabetical order
 * 
 * ===================================================================================================== */

//provides a common inheritance for nodes and relationships
module.exports = function (neo4j)
{
	var _deletePropsFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							   { name: 'props', optional: true },
							   { name: 'callback', type: 'function', optional: true } ];
	
	var _refreshFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
						   { name: 'callback', type: 'function', optional: true } ];
	
	var _setPropsFormat = [{ name: 'batch', optional: true, instance: neo4j.Api.Batch },
						   { name: 'key', type: 'string', optional: true },
						   { name: 'value', requires: 'key', requiredBy: 'key' },
						   { name: 'props', type: 'object', mutex: 'key' },
						   { name: 'callback', type: 'function' }];
	
	function Base (obj)
	{
		this.id = neo4j.Utils.parseId(obj.self);
		this.data = obj.data;
		Object.freeze(this.data); // being able to edit data would give the false impression that the node/relationship can be updated in that fashion
		
		Object.freeze(obj);
		Object.defineProperty(this, '_obj', { value: obj, enumerable: false, writable: false });
	}
	
	Base.prototype.deleteProperties = function (/* batch, */ props, callback)
	{
		var args = neo4j.Utils.parseArgs(arguments, _deletePropsFormat);
		if (!args.callback)
			args.callback = function () {};
		
		if (args.props === undefined)
			args.props = ''; //causes all properties to be deleted
		
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint.bind(null, Url.parse(this._obj.properties)), args.props, 'DELETE', null, neo4j.Utils.errorOnly(args.callback))
	};
	
	Base.prototype.refreshProperties = function (/* batch, */ callback)
	{
		var args = neo4j.Utils.parseArgs(arguments, _refreshFormat);
		new neo4j.Api.Request(args.batch, Url.parse(this._obj.properties), 'GET', null, function (error, obj)
		{
			if (!error)
				this.data = obj;
			
			if (args.callback)
				args.callback(error, obj);
		});
	};
	
	Base.prototype.replaceAllProperties = function (/* batch, */ props, callback)
	{
		var args = neo4j.Utils.parseArgs(arguments, _setPropsFormat);
		
		if (args.key)
		{
			args.props = {};
			args.props[args.key] = args.value;
		}
		
		neo4j.Utils.autoBatch(args.batch, Url.parse(this._obj.properties), 'PUT', args.props, neo4j.Utils.errorOnly(args.callback));
	};
	
	Base.prototype.setProperties = function (/* batch, */ props, callback)
	{
		var args = neo4j.Utils.parseArgs(arguments, _setPropsFormat);
		
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
		
		neo4j.Utils.autoBatch(args.batch, neo4j.Api.getEndpoint.bind(null, Url.parse(this._obj.properties)), args.key, 'PUT', args.value, neo4j.Utils.errorOnly(args.callback));
	};
	
	Base.prototype.setProperty = Base.prototype.setProperties;
	
	Base.prototype.valueOf = function () { return this.id; };
	
	return Base;
};

/* ========================================================================================================
 * 
 * Private Methods - Keep in alphabetical order
 * 
 * ===================================================================================================== */

// code

/* ========================================================================================================
 * 
 * Initialization
 * 
 * ===================================================================================================== */

// If function calls need to be made to initialize the module, put those calls here.
