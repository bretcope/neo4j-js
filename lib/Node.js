
var arguer = require('arguer');
var Url = require('url');

/* ========================================================================================================
 * 
 * Private Members Declaration (no methods)
 * 
 * ===================================================================================================== */

var _idRegex = /\d+$/;

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

module.exports = function (neo4j)
{
	var _createRelFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
							 'node',
							 'type',
							 { name: 'data', type: 'object', optional: true },
							 { name: 'callback', type: 'function' } ];
	
	var _getRelsFormat = [ { name: 'batch', optional: true, instance: neo4j.Api.Batch },
						   { name: 'type', optional: true, type: 'string' },
						   { name: 'types', instance: Array, mutex: 'type' },
						   { name: 'callback', type: 'function' } ];
	
	function Node (obj)
	{
		neo4j.Base.call(this, obj);
	}
	
	neo4j.Utils.inherit(neo4j.Base, Node);
	
	Node.nodeCallback = function (callback)
	{
		return function (error, obj)
		{
			if (error)
			{
				callback(error);
			}
			else
			{
				if (obj instanceof Array)
				{
					var nodes = [];
					for (var i in obj)
					{
						nodes.push(new Node(obj[i]));
					}
					
					callback(error, nodes);
				}
				else
				{
					callback(error, new Node(obj));
				}
			}
		};
	};
	
	Node.prototype.createRelationshipFrom = function (/* batch, */ node, type, data, callback)
	{
		var args = arguer(arguments, _createRelFormat);
		createRelationship(args.batch, args.node, this, args.type, args.data, args.callback);
	};
	
	Node.prototype.createRelationshipTo = function (/* batch, */ node, type, data, callback)
	{
		var args = arguer(arguments, _createRelFormat);
		createRelationship(args.batch, this, args.node, args.type, args.data, args.callback);
	};
	
	Node.prototype.getAllRelationships = function (/* batch, type(s), */ callback)
	{
		var args = arguer(arguments, _getRelsFormat);
		getRelationships(args.batch, Url.parse(this._obj.all_relationships), args.type, args.types, args.callback);
	};
	
	Node.prototype.getIncomingRelationships = function (/* batch, type(s), */ callback)
	{
		var args = arguer(arguments, _getRelsFormat);
		getRelationships(args.batch, Url.parse(this._obj.incoming_relationships), args.type, args.types, args.callback);
	};
	
	Node.prototype.getOutgoingRelationships = function (/* batch, type(s), */ callback)
	{
		var args = arguer(arguments, _getRelsFormat);
		getRelationships(args.batch, Url.parse(this._obj.outgoing_relationships), args.type, args.types, args.callback);
	};
	
	/* ========================================================================================================
	 * 
	 * Private Methods - Keep in alphabetical order
	 * 
	 * ===================================================================================================== */

	function createRelationship (batch, from, to, type, data, callback)
	{
		var body = { type: type };
		body.to = to instanceof Node ? to._obj.self : neo4j.Api.getEndpoint('node', to).href;
		
		if (data)
			body.data = data;
		
		var endpoint;
		if (from instanceof Node)
		{
			endpoint = Url.parse(from._obj.create_relationship);
		}
		else
		{
			//don't have a create relationship explicitly defined for the from object, so we'll create on based on the 'to' node.
			//either to or from or both must be a Node object (this is handled internally so it should never be violated).
			endpoint = Url.parse(to._obj.create_relationship.replace('/' + to.id + '/', '/' + from + '/'));
		}
		
		var req = new neo4j.Api.Request(batch, endpoint, 'POST', body, neo4j.Relationship.relationshipCallback(callback));
	}
	
	function getRelationships(batch, endpoint, type, types, callback)
	{
		if (type)
		{
			endpoint = neo4j.Api.getEndpoint(endpoint, type);
		}
		else if (types)
		{
			endpoint = neo4j.Api.getEndpoint(endpoint, types.join('&'));
		}
		
		new neo4j.Api.Request(batch, endpoint, 'GET', null, neo4j.Relationship.relationshipCallback(callback));
	}
 
	/* ========================================================================================================
	 * 
	 * Initialization
	 * 
	 * ===================================================================================================== */
	
	return Node;
};
