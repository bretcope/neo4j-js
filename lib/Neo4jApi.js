
var Base = require('./Base.js');
var Graph = require('./Graph.js');
var Http = require('http');
var Https = require('https');
var Neo4jUtils = require('./Neo4jUtils.js');
var Node = require('./Node.js');
var Path = require('./Path.js');
var Relationship = require('./Relationship.js');
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

module.exports.connect = function (initUrl, callback)
{
	var _basePath;
	var _endpoints = {};

	/* ========================================================================================================
	 * 
	 * Initialization
	 * 
	 * ===================================================================================================== */
	
	// setup internal namespace
	var neo4j = {};
	
	neo4j.Api = 
	{
		Batch: Batch,
		Request: Request,
		getEndpoint: getEndpoint,
		reconnect: reconnect
	};
	
	neo4j.Utils = new Neo4jUtils(neo4j);
	
	neo4j.Base = Base(neo4j);
	neo4j.Node = Node(neo4j);
	neo4j.Relationship = Relationship(neo4j);
	neo4j.Path = Path(neo4j);
	
	neo4j._graph = new Graph(neo4j);
	
	process.nextTick(reconnect.bind(null, initUrl, callback)); // let the Request class get setup before calling anything.

	/* ========================================================================================================
	 * 
	 * Internal Methods - Keep in alphabetical order
	 * 
	 * ===================================================================================================== */
	
	function getEndpoint (endpoint, path)
	{
		var result = {};
		
		if (typeof endpoint === 'string')
			endpoint = _endpoints[endpoint];
		
		if (!path)
			return endpoint;
		
		for (var i in endpoint)
		{
			result[i] = endpoint[i];
		}
		
		// this always discards any query which existed in the original endpoint. This should not be a problem unless neo4j starts using query strings in their base url's
		result.path = neo4j.Utils.pathJoin(result.pathname, path + '');
		result.href = result.protocol + '//' + result.hostname + ':' + result.port + result.path;
		
		return result;
	}
	
	function reconnect (initUrl, callback)
	{
		var endpoint = Url.parse(initUrl);
		_endpoints.root = endpoint;
		
		_basePath = endpoint.pathname;
		if (_basePath[_basePath.length - 1] === '/') // this should always be true, but just in case it changes in the future
			_basePath = _basePath.substr(0, _basePath.length - 1);
		
		new Request(null, endpoint, 'GET', null, function (error, obj)
		{
			if (error)
			{
				callback(error);
				return;
			}
			
			for (var i in obj)
			{
				if (i === 'neo4j_version')
					neo4j._graph.version = obj[i];
				else if (i !== 'extensions')
					_endpoints[i] = Url.parse(obj[i]);
			}
			
			if (!_endpoints.relationship) // for some reason, the api doesn't directly provide the endpoint for relationships, so we'll create it
			{
				_endpoints.relationship = {};
		
				for (i in _endpoints.node)
				{
					switch (i)
					{
						case 'path':
						case 'pathname':
						case 'href':
							_endpoints.relationship[i] = _endpoints.node[i].replace(/node$/, 'relationship');
							break;
						default:
							_endpoints.relationship[i] = _endpoints.node[i];
							break;
					}
				}
			}
			
			callback(null, neo4j._graph);
		});
	}

	/* ========================================================================================================
	 * 
	 * Request Class
	 * 
	 * ===================================================================================================== */
	
	function Batch ()
	{
		this.requests = [];
		this.run = runBatch.bind(null, this.requests);
	}

	/* ========================================================================================================
	 * 
	 * Request Class
	 * 
	 * ===================================================================================================== */
	
	function Request (batch, endpoint, method, data, callback)
	{
		this.endpoint = typeof endpoint === 'string' ? _endpoints[endpoint] : endpoint;
		this.method = method;
		this.data = data;
		this.callback = callback;
		
		if (batch)
			batch.requests.push(this);
		else
			this.send(); // if no batch, send immediately
	}
	
	Request.prototype.send = function ()
	{
		var options = 
		{
			hostname: this.endpoint.hostname,
			port: this.endpoint.port,
			path: this.endpoint.path,
			method: this.method,
			headers: { Accept: 'application/json'/*, 'X-Stream': 'true' */}
		};
		
		if (this.data !== undefined && this.data !== null)
			options.headers['Content-Type'] = 'application/json'; // this doesn't appear to be necessary, but perhaps it is for backwards compatibility.
		
		var http = this.endpoint.protocol === 'https:' ? Https : Http;
		
		var request = http.request(options, Request.createCallback(this.callback));
		request.on('error', this.callback);
		
		if (this.data !== undefined && this.data !== null)
			request.write(JSON.stringify(this.data));
		
		request.end();
	};
	
	Request.createCallback = function (callback)
	{
		return function (response)
		{
			var result = [];
			var error = null;
			if (response.statusCode > 204)
			{
				error = new Error('Unspecified neo4j API Error.');
				error.code = response.statusCode;
			}
			
			response.setEncoding('utf8');
			response.on('data', function (data) { result.push(data); });
			
			response.on('end', function ()
			{
				try
				{
					var obj = null;
					
					if (result.length)
						obj = JSON.parse(result.join(''));
					
					if (error)
					{
						if (obj)
						{
							error.innerError = obj;
							error.message = obj.message;
							error.exception = obj.exception;
							error.fullname = obj.fullname;
						}
						callback (error);
					}
					else
					{
						callback(null, obj);
					}
				}
				catch (e)
				{
					callback(e);
				}
			});
		};
	};
	
	function runBatch (requests, errorCallback)
	{
		if (requests.length === 0)
			return;
		
		if (requests.length === 1)
		{
			requests[0].send();
			return;
		}
		
		var req = [];
		
		for (var i = 0; i < requests.length; i++)
		{
			req.push(
			{
				id: i,
				method: requests[i].method,
				to: requests[i].endpoint.path.substr(_basePath.length),
				body: requests[i].data !== null ? requests[i].data : undefined
			});
		}
		
		new Request(null, 'batch', 'POST', req, function (error, obj)
		{
			if (error || obj.length < req.length || (obj[obj.length - 1].status && obj[obj.length - 1].status > 204))
			{
				if (!error)
				{
					error = new Error(obj[obj.length - 1].body ? obj[obj.length - 1].body.message : 'Unknown neo4j REST API Error');
					error.code = obj[obj.length - 1].status;
					if (obj[obj.length - 1].body)
						error.exception = obj[obj.length - 1].body.exception;
					error.innerError = obj[obj.length - 1].body;
				}
				
				if (errorCallback)
				{
					errorCallback(error);
				}
				else
				{
					for (var i in requests)
						requests[i].callback(error);
				}
			}
			else
			{
				for (var i in requests)
				{
					requests[obj[i].id].callback(null, obj[i].body);
				}
			}
		});
	}
};
