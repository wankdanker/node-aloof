var compareStringMap = {
	/* a represents the value of the dynamic item being tested
	 * b represents the value that we are testing with
	 *
	 * that's still really not that clear.
	 *
	 * a is the value from the object
	 * b is the value from the filter
	 *
	 * that might be better
	 */
	"=" : "( {a} == {b} )",
	"==" : "( {a} == {b} )",
	"===" : "( {a} === {b} )",
	"!=" : "( {a} != {b} )",
	"!==" : "( {a} !== {b} )",
	">" : "( {a} > {b} )",
	">=" : "( {a} >= {b} )",
	"<" : "( {a} < {b} )",
	"<=" : "( {a} <= {b} )",
	"in" : "( ~{b}.indexOf({a}) )",
	"contains" : "( ~{a}.indexOf({b}) )",
	"startsWith" : "( (new RegExp('^' + {b})).test({a}) )",
	"endsWith" : "( (new RegExp({b} + '$')).test({a}) )",
	"match" : "( (new RegExp({b})).test({a}) )",
	"between" : "( ({b} < {a}) && ({a} < {c}) )",
	"betweenEquals" :"( ({b} <= {a}) && ({a} <= {c}) )",
	"outside" : "( ({a} < {b}) || ({c} < {a}) )",
	"outsideEquals" :"( ({a} <= {b}) || ({c} <= {a}) )",
	"truthy" : "( {a} )",
	"falsy" : "( !{a} )"
};

var logicalOperatorMap = {
	"and" : function (a, b) { return a && b},
	"or" : function (a, b) { return a || b}
};

module.exports = filter;

function filter (obj, filters) {
	if (!Array.isArray(obj)) {
		obj = [obj];
	}
	
	return createFilterFunction(filters)(obj);
}

filter.createFilterFunction = createFilterFunction;

function createFilterFunction(filters) {
	var //index for looping through filters
		  filterIx
		//alias for the current filter being processed
		, filter
		//key index for looping through columns with the filter
		, attributeKey
		//alias for the current comparison object being used
		, objCompare
		//index for looping through comparisons an objCompare
		, objCompareIx
		//alias for the current comparison
		, comp
		//
		, compstr
		//
		, executionPlan = []
		//
		, sequence
		//
		, filterFunction
		;
	
	//convert the filter to an array
	if (!Array.isArray(filters)) {
		filters = [filters];
	}
	
	//build the execution plan
	for (filterIx = 0; filterIx < filters.length; filterIx++) {
		filter = filters[filterIx];
		
		sequence = [];
		
		for (attributeKey in filter) {
			objCompare = filter[attributeKey];
			
			if (!Array.isArray(objCompare)) {
				objCompare = [objCompare]
				filter[attributeKey] = objCompare;
			}
			
			for (objCompareIx = 0; objCompareIx < objCompare.length; objCompareIx ++) {
				comp = objCompare[objCompareIx];
				
				compstr = compareStringMap[comp.comparison];
				
				sequence.push(
					compstr.replace("{a}","getValue(obj, '" + attributeKey + "')")
						.replace("{b}","filters[" + filterIx + "]['" + attributeKey + "'][" + objCompareIx + "].value")
						.replace("{c}","filters[" + filterIx + "]['" + attributeKey + "'][" + objCompareIx + "].value2")
				);
			}
		};
		
		executionPlan.push("( " + sequence.join(" && ") + " )");
	};
	
	var fnString = "filterFunction = function (data) {"
		+ "	var result = [], obj;"
		+ "	for (var x = 0; x < data.length; x++) {"
		+ "		obj = data[x];"
		+ "		if ( " + executionPlan.join(" || ") + " ) {"
		+ "			result.push(obj);"
		+ "		}"
		+ " }"
		+ " return result;"
		+ "};"
	
	eval(fnString);
	
	return filterFunction;
}

function getValue(obj, key) {
	var context = obj
		, bail = false
		, keys = key.split('.')
		, thisKey = null;
	
	for (var x = 0; x < keys.length; x ++ ) {
		thisKey = keys[x];
		
		if (typeof(context) != 'object' || !context.hasOwnProperty(thisKey)) {
			bail = true;
			break;
		}
		else {
			context = context[thisKey];
		}
	}

	return (bail) ? undefined : context;
}

filter['with'] = using;
filter.using = using;
filter.create = using;

function using (data) {
	return new Selector(data);
}

filter.Selector = Selector;

function Selector (data) {
	var self = this;
	
	self.data = data;
	
	self.filters = [{}];
	self.haveFilter = false;
	self.filterCallback = null;
	
	self.currentFilter = self.filters[0];
	self.lastAttribute = null;
	self.lastField = null;
	self.lastMethodName = null;
	
	self.sortFields = {};
	self.selectFields = {};
	self.groupFields = {};
}

Selector.methods = {
	"equals" : 			"==",
	"notEquals" : 		"!=",
	"starts" : 			"startsWith",
	"ends" :			"endsWith",
	"contains" : 		"contains",
	"match" : 			"match",
	//type
	
	"greater" : 		">",
	"greaterThan" : 	">",
	"greaterEquals" : 	">=",
	"greaterThanEquals" : ">=",
	
	"less" : 			"<",
	"lessThan" : 		"<",
	"lessEquals" :		"<=",
	"lessThanEquals" :	"<=",
	
	"between" :			"between",
	"betweenEquals" :	"betweenEquals",
	
	"outside" :			"outside",
	"outsideEquals" :	"outsideEquals",
	
	"truthy" :			"truthy",
	"falsey" :			"falsy",
	"falsy" :			"falsy",
	"in" :				"in"
	//empty
	//is
};

//define all of the convenience methods
for (methodName in Selector.methods) {
	(function (methodName, comparison) {
		Selector.prototype[methodName] = function (field, value, value2) {
			var self = this;
			
			self.haveFilter = true;
			self.filterFunction = null;
			self.currentFilter[field] = self.currentFilter[field] || [];
			
			self.lastAttribute = {
				comparison : comparison,
				value : value,
				value2 : value2
			}
			
			self.currentFilter[field].push(self.lastAttribute)
			
			self.lastField = field;
			self.lastMethodName = methodName;
			
			return self;
		};
	})(methodName, Selector.methods[methodName]);
}

Selector.prototype.using = function (data) {
	var self = this;
	
	self.data = data;
	
	return self;
};

Selector.prototype.executeFilter = function (data) {
	var self = this, result = [];
	
	if (!self.filterFunction) {
		self.filterFunction = createFilterFunction(self.filters);
	}
	
	if (!Array.isArray(data)) {
		data = [data];
	}
	
	return self.filterFunction(data);
};

Selector.prototype.or = function () {
	var self = this
		, args = Array.prototype.slice.call(arguments)
		;
	
	self.filterFunction = null;
	self.currentFilter = {};
	self.filters.push(self.currentFilter);
	
	//if value(s) were passed then apply the previous filter method
	if (args.length) {
		args.unshift(self.lastField);
		self[self.lastMethodName].apply(this, args);
	}
	
	return this;
};

//set the filter object
Selector.prototype.filter = function (obj) {
	var self = this;
	
	self.filterFunction = null;
	
	if (!obj) {
		return self.filters;
	}
	else {
		self.filters = [].concat(obj);
		return self;
	}
};

//specify the sort options
Selector.prototype.sort = function () {
	var self = this
		, args = Array.prototype.slice.call(arguments)
		, coerce = function (a) { return a }
		;
	
	if (!args.length) {
		//no sort specified; reset sort instead
		self.sortFields = {};
		
		return self;
	}
	
	if (args.length == 2 && typeof(args[1]) == 'function') {
		coerce = args[1];
		args.pop();
	}
	
	args = args.reverse();
	
	args.forEach(function (key, ix) {
		if (/^-/.test(key)) {
			self.sortFields[key.replace(/^-/,'')] = { 
				direction : 'desc',
				coerce : coerce
			};
		}
		else {
			self.sortFields[key] = {
				direction : 'asc',
				coerce : coerce
			};
		}
	});
	
	return self;
}

Selector.prototype.group = function (field) {
	var self = this;
	
	self.groupFields[field] = true;
	
	return this;
};

Selector.prototype.count = function () {
	var self = this;
	
	if (self.haveFilter) {
		result = self.executeFilter(self.data);
	}
	else {
		result = self.data;
	}
	
	return result.length;
};

Selector.prototype.select = function () {
	var self = this
		, result
		, tmp
		, selectFields
		;
	
	if (self.haveFilter) {
		result = self.executeFilter(self.data);
	}
	else {
		result = self.data.slice(0); //copy the array
	}
	
	if (Object.keys(self.sortFields).length) {
		//sort first
		doSort(self.sortFields, result);
	}
	
	if (arguments.length) {
		selectFields = Array.prototype.slice.call(arguments);
		
		result.forEach(function (record, ix) {
			var obj = {};
			
			selectFields.forEach(function (field, ix) {
				obj[field] = getValue(record, field);
			});
			
			result[ix] = obj;
		});
	}
	
	if (Object.keys(self.groupFields).length) {
		result.groups = doGroup(self.groupFields, result);
	}
	
	return result;
};

Selector.prototype.sum = function (column) {
	var self = this;
	
	return this.select().reduce(function (x, record) {
		return x += parseFloat(record[column]) || 0;
	}, 0);
};

Selector.prototype.max = function (column) {
	var self = this;
	
	var ary = this.select();
	
	return ary.reduce(function (x, record) {
		return Math.max(x, record[column]);
	}, ary[0][column]);
};

Selector.prototype.min = function (column) {
	var self = this;
	
	var ary = this.select();
	
	return ary.reduce(function (x, record) {
		return Math.min(x, record[column]);
	}, ary[0][column]);
};

Selector.prototype.avg = function (column) {
	var self = this;
	
	var ary = this.select();
	var sum = ary.reduce(function (x, record, ix) {
		if (ix === 1) {
			return x[column] + record[column];
		}
		
		return x + record[column];
	});
	
	return sum / ary.length;
};

function doSort (sort, records) {
	var keys = Object.keys(sort).reverse();
	
	keys.forEach(function (key, ix) {
		var dir = sort[key].direction;
		var coerce = sort[key].coerce;
		
		records.sort(function (a, b) {
			var val1 = coerce((dir == 'desc') ? b[key] : a[key]);
			var val2 = coerce((dir == 'desc') ? a[key] : b[key]);
			
			if (val1 < val2) {
				return -1;
			}
			
			if (val1 > val2) {
				return 1;
			}
			
			return 0;
		});
	});
	
	return records
};

function doGroup (group, records) {
	var resultGrouping = {};
	
	Object.keys(group).forEach(function (groupKey) {
		var objGroup = resultGrouping[groupKey] = resultGrouping[groupKey] || {} ;
		
		records.forEach(function (record) {
			objGroup[record[groupKey]] = objGroup[record[groupKey]] || [];
			
			objGroup[record[groupKey]].push(record);
		});
	});
	
	return resultGrouping;
}

