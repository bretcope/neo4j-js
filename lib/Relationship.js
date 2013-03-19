
var Base = require('./Base.js');

/* ========================================================================================================
 * 
 * Private Members Declaration (no methods)
 * 
 * ===================================================================================================== */

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
	function Relationship (obj)
	{
		neo4j.Base.call(this, obj);
		this.type = obj.type;
		this.start = neo4j.Utils.parseId(obj.start);
		this.end = neo4j.Utils.parseId(obj.end);
	}
	
	neo4j.Utils.inherit(neo4j.Base, Relationship);
	
	Relationship.relationshipCallback = function (callback)
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
					var rels = [];
					for (var i in obj)
					{
						rels.push(new Relationship(obj[i]));
					}
					
					callback(error, rels);
				}
				else
				{
					callback(error, new Relationship(obj));
				}
			}
		};
	};
	
	return Relationship;
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
