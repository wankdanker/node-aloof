import getValue from 'get-value'

// Type definitions
type ComparisonValue = string | number | boolean | Date | null | any[];

interface ComparisonObject {
  comparison: string;
  value: ComparisonValue;
  value2?: ComparisonValue;
}

interface FilterAttribute {
  [key: string]: ComparisonObject | ComparisonObject[];
}

type Filter = FilterAttribute;
type Filters = Filter | Filter[];

interface SortField {
  direction: 'asc' | 'desc';
  coerce: (value: any) => any;
}

interface SortFields {
  [key: string]: SortField;
}

interface GroupFields {
  [key: string]: boolean;
}

interface SelectFields {
  [key: string]: boolean;
}

type DataItem = Record<string, any>;
type DataArray = DataItem[];

interface CompareStringMap {
  [key: string]: string;
}

interface LogicalOperatorMap {
  [key: string]: (a: boolean, b: boolean) => boolean;
}

// Implementation
const compareStringMap: CompareStringMap = {
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
  "=": "( {a} == {b} )",
  "==": "( {a} == {b} )",
  "===": "( {a} === {b} )",
  "!=": "( {a} != {b} )",
  "!==": "( {a} !== {b} )",
  ">": "( {a} > {b} )",
  ">=": "( {a} >= {b} )",
  "<": "( {a} < {b} )",
  "<=": "( {a} <= {b} )",
  "in": "( ~{b}.indexOf({a}) )",
  "contains": "( ~{a}.indexOf({b}) )",
  "startsWith": "( (new RegExp('^' + {b})).test({a}) )",
  "endsWith": "( (new RegExp({b} + '$')).test({a}) )",
  "match": "( (new RegExp({b})).test({a}) )",
  "between": "( ({b} < {a}) && ({a} < {c}) )",
  "betweenEquals": "( ({b} <= {a}) && ({a} <= {c}) )",
  "outside": "( ({a} < {b}) || ({c} < {a}) )",
  "outsideEquals": "( ({a} <= {b}) || ({c} <= {a}) )",
  "truthy": "( {a} )",
  "falsy": "( !{a} )"
};

const logicalOperatorMap: LogicalOperatorMap = {
  "and": function (a, b) { return a && b },
  "or": function (a, b) { return a || b }
};

function filter (obj: DataItem | DataArray, filters: Filters): DataArray {
  let dataArray: DataArray

  if (!Array.isArray(obj)) {
    dataArray = [obj];
  }
  else {
    dataArray = obj
  }

  return createFilterFunction(filters)(dataArray);
}

function createFilterFunction (filters: Filters): (data: DataArray) => DataArray {
  let //index for looping through filters
    filterIx: number
    //alias for the current filter being processed
    , filter: Filter
    //key index for looping through columns with the filter
    , attributeKey: string
    //attributeKey but cleaned of any escape sequences
    , cleanKey: string
    //alias for the current comparison object being used
    , objCompare: ComparisonObject | ComparisonObject[]
    //index for looping through comparisons an objCompare
    , objCompareIx: number
    //alias for the current comparison
    , comp: ComparisonObject
    //
    , compstr: string
    //
    , executionPlan: string[] = []
    //
    , sequence: string[]
    //
    , filterFunction: (data: DataArray) => DataArray
    //
    , getvaluestr: string
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
      cleanKey = clean(attributeKey);

      if (!Array.isArray(objCompare)) {
        objCompare = [objCompare];
        filter[attributeKey] = objCompare;
      }

      for (objCompareIx = 0; objCompareIx < objCompare.length; objCompareIx++) {
        comp = objCompare[objCompareIx];

        compstr = compareStringMap[comp.comparison];

        if (comp.value && comp.value.constructor && comp.value.constructor.name === "Date") {
          getvaluestr = "new Date(getValue(obj, '" + cleanKey + "'))";
        }
        else {
          getvaluestr = "getValue(obj, '" + cleanKey + "')";
        }

        sequence.push(
          compstr.replace(/\{a\}/gi, getvaluestr)
            .replace(/\{b\}/gi, "filters[" + filterIx + "]['" + cleanKey + "'][" + objCompareIx + "].value")
            .replace(/\{c\}/gi, "filters[" + filterIx + "]['" + cleanKey + "'][" + objCompareIx + "].value2")
        );
      }
    }

    executionPlan.push("( " + sequence.join(" && ") + " )");
  }

  const fnBody = `
    'use strict';
    return function(data) {
      const result = [];
      let obj;
      for (var x = 0; x < data.length; x++) {
        obj = data[x];
        if (${executionPlan.join(" || ")}) {
          result.push(obj);
        }
      }
      return result;
    }
  `;

  // Create a function that has access to getValue and filters
  const fn = new Function('getValue', 'filters', fnBody) as 
    (getValue: (obj: DataItem, key: string) => any, filters: Filters) => (data: DataArray) => DataArray;

  // Return the function with getValue and filters already bound
  return fn(getValue, filters);
}

function using (data?: DataArray): Selector {
  return new Selector(data ?? []);
}

// Define the type for the Selector class, including all dynamic methods
class Selector {
  // Explicitly declare all dynamic methods from Selector.methods
  equals!: (field: string, value: any, value2?: any) => Selector;
  notEquals!: (field: string, value: any, value2?: any) => Selector;
  starts!: (field: string, value: any, value2?: any) => Selector;
  ends!: (field: string, value: any, value2?: any) => Selector;
  contains!: (field: string, value: any, value2?: any) => Selector;
  match!: (field: string, value: any, value2?: any) => Selector;
  greater!: (field: string, value: any, value2?: any) => Selector;
  greaterThan!: (field: string, value: any, value2?: any) => Selector;
  greaterEquals!: (field: string, value: any, value2?: any) => Selector;
  greaterThanEquals!: (field: string, value: any, value2?: any) => Selector;
  less!: (field: string, value: any, value2?: any) => Selector;
  lessThan!: (field: string, value: any, value2?: any) => Selector;
  lessEquals!: (field: string, value: any, value2?: any) => Selector;
  lessThanEquals!: (field: string, value: any, value2?: any) => Selector;
  between!: (field: string, value: any, value2?: any) => Selector;
  betweenEquals!: (field: string, value: any, value2?: any) => Selector;
  outside!: (field: string, value: any, value2?: any) => Selector;
  outsideEquals!: (field: string, value: any, value2?: any) => Selector;
  truthy!: (field: string) => Selector;
  falsey!: (field: string) => Selector;
  falsy!: (field: string) => Selector;
  in!: (field: string, value: any, value2?: any) => Selector;
  static methods: Record<string, string> = {
    "equals": "==",
    "notEquals": "!=",
    "starts": "startsWith",
    "ends": "endsWith",
    "contains": "contains",
    "match": "match",
    //type

    "greater": ">",
    "greaterThan": ">",
    "greaterEquals": ">=",
    "greaterThanEquals": ">=",

    "less": "<",
    "lessThan": "<",
    "lessEquals": "<=",
    "lessThanEquals": "<=",

    "between": "between",
    "betweenEquals": "betweenEquals",

    "outside": "outside",
    "outsideEquals": "outsideEquals",

    "truthy": "truthy",
    "falsey": "falsy",
    "falsy": "falsy",
    "in": "in"
    //empty
    //is
  };

  data: DataArray;
  filters: Filter[];
  haveFilter: boolean;
  filterCallback: (() => void) | null;
  currentFilter: Filter;
  lastAttribute: ComparisonObject | null;
  lastField: string | null;
  lastMethodName: string | null;
  sortFields: SortFields;
  selectFields: SelectFields;
  groupFields: GroupFields;
  filterFunction: ((data: DataArray) => DataArray) | null;

  constructor (data: DataArray) {
    this.data = data;

    this.filters = [{}];
    this.haveFilter = false;
    this.filterCallback = null;

    this.currentFilter = this.filters[0];
    this.lastAttribute = null;
    this.lastField = null;
    this.lastMethodName = null;

    this.sortFields = {};
    this.selectFields = {};
    this.groupFields = {};
    this.filterFunction = null;
  }

  using (data: DataArray): Selector {
    this.data = data;
    return this;
  }

  executeFilter (data: DataItem | DataArray): DataArray {
    let dataArray: DataArray;

    if (!this.filterFunction) {
      this.filterFunction = createFilterFunction(this.filters);
    }

    if (!Array.isArray(data)) {
      dataArray = [data];
    }
    else {
      dataArray = data;
    }

    return this.filterFunction(dataArray);
  }

  or (...args: any[]): Selector {
    this.filterFunction = null;
    this.currentFilter = {};
    this.filters.push(this.currentFilter);

    //if value(s) were passed then apply the previous filter method
    if (args.length && this.lastField && this.lastMethodName) {
      args.unshift(this.lastField);
      // Using type assertion to handle dynamic method call
      (this as any)[this.lastMethodName].apply(this, args);
    }

    return this;
  }

  filter<T extends Filter | Filter[] | undefined> (obj?: T): T extends undefined ? Filter[] : Selector {
    this.filterFunction = null;

    if (!obj) {
      return this.filters as any; // Type assertion needed
    }
    else {
      this.filters = [].concat(obj as any);
      return this as any; // Type assertion needed
    }
  }

  sort (...args: any[]): Selector {
    let coerce: (a: any) => any = function (a) { return a };

    if (!args.length) {
      //no sort specified; reset sort instead
      this.sortFields = {};

      return this;
    }

    if (args.length == 2 && typeof (args[1]) == 'function') {
      coerce = args[1];
      args.pop();
    }

    args.forEach((key: string, ix: number) => {
      if (/^-/.test(key)) {
        this.sortFields[key.replace(/^-/, '')] = {
          direction: 'desc',
          coerce: coerce
        };
      }
      else {
        this.sortFields[key] = {
          direction: 'asc',
          coerce: coerce
        };
      }
    });

    return this;
  }

  group (field: string): Selector {
    this.groupFields[field] = true;
    return this;
  }

  count (): number {
    let result: DataArray;

    if (this.haveFilter) {
      result = this.executeFilter(this.data);
    }
    else {
      result = this.data;
    }

    return result.length;
  }

  select (...args: string[]): any[] {
    let result: DataArray
      , selectFields: string[]
      ;

    if (this.haveFilter) {
      result = this.executeFilter(this.data);
    }
    else {
      result = this.data.slice(0); //copy the array
    }

    if (Object.keys(this.sortFields).length) {
      //sort first
      doSort(this.sortFields, result);
    }

    if (args.length) {
      selectFields = args;

      result.forEach(function (record: DataItem, ix: number) {
        const obj: DataItem = {};

        selectFields.forEach(function (field: string) {
          obj[field] = getValue(record, field);
        });

        result[ix] = obj;
      });
    }

    if (Object.keys(this.groupFields).length) {
      (result as any).groups = doGroup(this.groupFields, result);
    }

    return result;
  }

  sum (column: string): number {
    return this.select().reduce(function (x: number, record: DataItem) {
      return x += parseFloat(record[column]) || 0;
    }, 0);
  }

  max (column: string): number {
    const ary = this.select();

    return ary.reduce(function (x: number, record: DataItem) {
      return Math.max(x, record[column]);
    }, ary[0][column]);
  }

  min (column: string): number {
    const ary = this.select();

    return ary.reduce(function (x: number, record: DataItem) {
      return Math.min(x, record[column]);
    }, ary[0][column]);
  }

  avg (column: string): number {
    const ary = this.select();
    let sum = ary.reduce(function (x: any, record: DataItem, ix: number) {
      if (ix === 1) {
        return x[column] + record[column];
      }

      return x + record[column];
    });

    return sum / ary.length;
  }
}

// Define dynamic methods based on Selector.methods
for (const methodName in Selector.methods) {
  ((methodName: string, comparison: string) => {
    (Selector.prototype as any)[methodName] = function (field: string, value: any, value2?: any): Selector {
      this.haveFilter = true;
      this.filterFunction = null;
      this.currentFilter[field] = this.currentFilter[field] || [];

      this.lastAttribute = {
        comparison: comparison,
        value: value,
        value2: value2
      };

      this.currentFilter[field].push(this.lastAttribute);

      this.lastField = field;
      this.lastMethodName = methodName;

      return this;
    };
  })(methodName, Selector.methods[methodName]);
}

function doSort (sort: SortFields, records: DataArray): DataArray {
  const keys = Object.keys(sort).reverse();

  keys.forEach((key: string) => {
    const dir = sort[key].direction;
    const coerce = sort[key].coerce;

    records.sort(function (a: DataItem, b: DataItem) {
      const val1 = coerce((dir == 'desc') ? b[key] : a[key]);
      const val2 = coerce((dir == 'desc') ? a[key] : b[key]);

      if (val1 == null && val2 != null) {
        return -1;
      }

      if (val1 != null && val2 == null) {
        return 1;
      }

      if (val1 == null && val2 == null) {
        return 0;
      }

      if (val1 < val2) {
        return -1;
      }

      if (val1 > val2) {
        return 1;
      }

      return 0;
    });
  });

  return records;
}

interface GroupResult {
  [key: string]: {
    [key: string]: DataArray;
  };
}

function doGroup (group: GroupFields, records: DataArray): GroupResult {
  const resultGrouping: GroupResult = {};

  Object.keys(group).forEach((groupKey: string) => {
    const objGroup: Record<string, DataArray> = resultGrouping[groupKey] = {};

    records.forEach((record: DataItem) => {
      objGroup[record[groupKey]] = objGroup[record[groupKey]] || [];
      objGroup[record[groupKey]].push(record);
    });
  });

  return resultGrouping;
}

function clean (str: string): string {
  return str.replace(/\\/gi, '\\\\') //escape the backslash
    .replace(/'/gi, '\\\'') //escape single quote
    .replace(/`/gi, '\\\`') //escape back tick
    .replace(/"/gi, '\\\"'); //escape double quote
}

// Module exports
filter.createFilterFunction = createFilterFunction;
filter['with'] = using;
filter.using = using;
filter.create = using;
filter.Selector = Selector;

export default filter;