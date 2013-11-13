
var arguer = require('arguer');

/* ========================================================================================================
 * 
 * Private Members Declaration (no methods)
 * 
 * ===================================================================================================== */

var _idRegex = /\d+$/;

/* ========================================================================================================
 * 
 * Utilities Namespace
 * 
 * ===================================================================================================== */

module.exports = function (neo4j)
{
	var _autoBatchFormat = [ { name: 'batch' }, 
							 { name: 'endpoint', optional:true, type: 'object' },
							 { name: 'namedEndpoint', type: 'string', mutex: 'endpoint' },
							 { name: 'factory', type: 'function', mutex: 'endpoint' },
							 { name: 'factoryArgs', instance: Array, requires: 'factory' },
							 { name: 'factoryArg', mutex: 'factoryArgs', requires: 'factory' },
							 { name: 'count', optional: true, type: 'number' },
							 { name: 'method', type: 'string' },
							 { name: 'data', nInstance: Array, nType: 'function', optional: true },
							 { name: 'datas', instance: Array, mutex: 'data' },
							 { name: 'callback', type: 'function' } ];

	/* ========================================================================================================
	 * 
	 * Public Methods - Keep in alphabetical order
	 * 
	 * ===================================================================================================== */
	
	this.autoBatch = function (batch, endpointOrFactory, factoryArgs, method, dataOrCount, callback)
	{
		var args = arguer(arguments, _autoBatchFormat);
		var noArray = false;
		
		if (!args.count)
		{
			if (args.datas)
			{
				args.count = args.datas.length;
			}
			else if (args.factoryArgs)
			{
				args.count = args.factoryArgs.length;
			}
			else
			{
				noArray = true;
				args.count = 1;
			}
		}
		
		batch = args.batch ? args.batch : new neo4j.Api.Batch();
		
		var returned = [];
		var combine = function (error, obj)
		{
			if (!returned)
				return;
			
			if (error)
			{
				args.callback(error);
				returned = null;
				return;
			}
			
			returned.push(obj);
			
			if (returned.length === args.count)
				args.callback(null, (noArray ? returned[0] : returned));
		};
		
		var endpoint = args.namedEndpoint ? neo4j.Api.getEndpoint(args.namedEndpoint) : args.endpoint;
		var d = args.data;
		for (var i = 0; i < args.count; i++)
		{
			if (args.factory)
			{
				if (args.factoryArgs && args.factoryArgs[i] !== undefined)
					endpoint = args.factoryArgs[i] instanceof Array ? args.factory.apply(null, args.factoryArgs[i]) : args.factory(args.factoryArgs[i]);
				else if (args.factoryArg !== undefined)
					endpoint = args.factoryArg instanceof Array ? args.factory.apply(null, args.factoryArg) : args.factory(args.factoryArg);
				else
					endpoint = args.factory();
			}
			
			if (args.datas && args.datas[i] !== undefined)
				d = args.datas[i];
			
			new neo4j.Api.Request(batch, endpoint, args.method, d, combine);
		}
		
		if (!args.batch)
			batch.run(combine);
	};
	
	this.errorOnly = function (callback)
	{
		return function (error)
		{
			callback(error);
		};
	};
	
	this.inherit = function (base, child)
	{
		var props = Object.keys(base.prototype);
		var p;
		for (var i in props)
		{
			p = props[i];
			if (p === 'valueOf')
				Object.defineProperty(child.prototype, 'valueOf', { value: base.prototype[p], enumerable: false });
			else
				child.prototype[p] = base.prototype[p];
		}
	};
	
	this.parseId = function (url)
	{
		return _idRegex.exec(url)[0];
	};
	
	this.pathJoin = function (a, b)
	{
		if (b[0] === '?')
			return a + b;
		
		if (b[0] === '/')
		{
			if (a[a.length - 1] === '/')
				return a + b.substr(1);
			
			return a + b;
		}
		
		if (a[a.length - 1] === '/')
			return a + b;
		
		return a + '/' + b;
	};
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
