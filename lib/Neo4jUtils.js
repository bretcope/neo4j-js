
// require statements go here

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
		var args = neo4j.Utils.parseArgs(arguments, _autoBatchFormat);
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

	/**
	 * Provides a crude way to implement function overloading. Each element of the format array is either a string representing a required 
	 * argument of any type, or an object which describes the accepted argument in more detail. These objects must contain the 'name' property.
	 * All other properties are optional.
	 * 
	 * name {string}		The name of the argument.
	 * optional {boolean}	If true, the argument will be considered optional.
	 * type {string}		If supplied typeof will be used to assess whether an argument is a match.
	 * nType {string}		Works opposite of type. In other words, an argument must not match this type in order to match.
	 * instance {Function}	Similar to type, except instanceof is used for comparison instead of typeof.
	 * nInstance {Function}	Opposite of instance.
	 * 
	 * Each of the following properties accept a string which represents the name of a previous argument. Only previous arguments can 
	 * referenced. In other words, arg with index 4 can reference any arg 0 through 3, but cannot reference arg >= 5. If any one ore more 
	 * of the following properties are used, optional:true is implied, and can be omitted.
	 * 
	 * requires {string}	The name of a preceding argument which must have been fulfilled in order for the current argument to be considered.
	 * requiredBy {string}	The name of a preceding argument which, if fulfiled, causes the current argument to be required instead of optional.
	 * mutex {string}		Essentially the opposite of requires&requiredBy. If the named argument was fulfilled, then the current argument will not be considered.
	 * 
	 * @param args {arguments}
	 * @param format {Array}
	 * @returns {{}} A hash table with the names of each format elements as keys. Optional format elements which were not fulfilled by an argument are undefined. 
	 */
	this.parseArgs = function (args, format)
	{
		var deficit = format.length - args.length;
		
		if (!format._optional)
		{
			format._optional = 0;
			for (var x in format)
			{
				if (format[x] && (format[x].optional || format[x].mutex || format[x].requires || format[x].requiredBy))
				{
					format[x].optional = true;
					format._optional++;
				}
			}
		}
		
		var result = {};
		
		if (deficit > format._optional)
		{
			throw new Error('Not enough arguments provided.');
		}
		
		var optionalIncluded = 0;
		var optionalSkipped = 0;
		var item;
		var argDex = 0;
		for (var i = 0; i < format.length; i++)
		{
			item = format[i];
			if (typeof item === 'string')
			{
				result[item] = args[argDex];
				argDex++;
			}
			else
			{
				if ((item.type && typeof args[argDex] !== item.type) ||
					(item.nType && typeof args[argDex] === item.nType) ||
					(item.instance && !(args[argDex] instanceof item.instance)) ||
					(item.nInstance && args[argDex] instanceof item.nInstance) ||
					(item.mutex && result[item.mutex] !== undefined) ||
					(item.requires && result[item.requires] === undefined))
				{
					if (item.optional && optionalSkipped < deficit && (!item.requiredBy || result[item.requiredBy] === undefined))
					{
						result[item.name] = undefined;
						optionalSkipped++;
					}
					else
					{
						throw new Error('Invalid Arguments');
					}
				}
				else
				{
					if (item.optional)
					{
						if ((format._optional - optionalIncluded) > deficit)
						{
							optionalIncluded++
						}
						else
						{
							optionalSkipped++;
							result[item.name] = undefined;
							continue;
						}
					}
					
					result[item.name] = args[argDex];
					argDex++;
				}
			}
		}
		
		return result;
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
