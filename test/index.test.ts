/* 
 * Test coverage for all filter operations and chaining methods
 */

import { describe, it, expect } from 'vitest';
import filter from '../src';

interface TestDataItem {
  id: number;
  b: string;
  name: string;
  gender: string;
  family: string;
  birthdate: string;
  mosquitoBites: number;
  nullableField: string | null;
  strNumber: string;
  child: {
    name: string;
  };
}

const testData: TestDataItem[] = [
  { id: 1, b: 'Something', name: 'Steve',    gender: 'male',   family: 'deer', birthdate: '4/1/2000', mosquitoBites: 430, nullableField: null, strNumber: '14', child: { name: 'Dan' }},
  { id: 2, b: 'Something', name: 'Dave',     gender: 'male',   family: 'wolf', birthdate: '7/20/2013', mosquitoBites: 98, nullableField: "asdf", strNumber: '2', child: { name: 'Derek' }},
  { id: 3, b: 'Something', name: 'Mary',     gender: 'female', family: 'deer', birthdate: '7/14/2013', mosquitoBites: 254, nullableField: "asdf", strNumber: '3', child: { name: 'Domino' }},
  { id: 4, b: 'Something', name: 'Margaret', gender: 'female', family: 'wolf', birthdate: '7/1/2013', mosquitoBites: 178, nullableField: "", strNumber: '1', child: { name: 'Darien' }}
];

describe('filter function', () => {
  it("should handle non-array input", () => {
    const result = filter(testData[0], {
      name: {
        comparison: '=',
        value: 'Steve'
      }
    });
    expect(result).toEqual([testData[0]]);
  });
});

describe('filter operations', () => {
  it("test '=' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '=',
        value : 1
      }
    });
    expect(result).toEqual([testData[0]]);
  });

  it("test '==' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '==',
        value : 1
      }
    });
    expect(result).toEqual([testData[0]]);
  });

  it("test '!=' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '!=',
        value : 1
      }
    });
    expect(result).toEqual([testData[1], testData[2], testData[3]]);
  });

  it("test '!==' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '!==',
        value : 1
      }
    });
    expect(result).toEqual([testData[1], testData[2], testData[3]]);
  });

  it("test '!==' comparison with type difference", () => {
    const result = filter(testData, {
      id : {
        comparison : '!==',
        value : '1'
      }
    });
    expect(result).toEqual([testData[0], testData[1], testData[2], testData[3]]);
  });

  it("test '>' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '>',
        value : 1
      }
    });
    expect(result).toEqual([testData[1], testData[2], testData[3]]);
  });

  it("test '>=' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '>=',
        value : 1
      }
    });
    expect(result).toEqual([testData[0], testData[1], testData[2], testData[3]]);
  });

  it("test '<' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '<',
        value : 4
      }
    });
    expect(result).toEqual([testData[0], testData[1], testData[2]]);
  });

  it("test '<=' comparison", () => {
    const result = filter(testData, {
      id : {
        comparison : '<=',
        value : 4
      }
    });
    expect(result).toEqual([testData[0], testData[1], testData[2], testData[3]]);
  });

  it("test 'in' comparison using string", () => {
    const result = filter(testData, {
      b : {
        comparison : 'in',
        value : 'xxxxxSomethingxxxxx'
      }
    });
    expect(result).toEqual([testData[0], testData[1], testData[2], testData[3]]);
  });

  it("test 'in' comparison using array", () => {
    const result = filter(testData, {
      id : {
        comparison : 'in',
        value : [4, 1]
      }
    });
    expect(result).toEqual([testData[0], testData[3]]);
  });

  it("test 'contains' comparison", () => {
    const result = filter(testData, {
      b : {
        comparison : 'contains',
        value : 'om'
      }
    });
    expect(result).toEqual([testData[0], testData[1], testData[2], testData[3]]);
  });

  it("test multiple filter or", () => {
    const result = filter(testData, [
      {
        family : {
          comparison : '=',
          value : 'deer'
        }
      },
      // implicit or 
      {
        gender : {
          comparison : '=',
          value : 'male'
        }
      }
    ]);
    expect(result).toEqual([testData[0], testData[1], testData[2]]);
  });

  it("test multiple filter (or) while one filter contains multiple attributes (and)", () => {
    const result = filter(testData, [
      {
        name : {
          comparison : '=',
          value : 'Joe'
        },
        // implicit and 
        family : {
          comparison : '=',
          value : 'deer'
        }
      },
      // implicit or 
      {
        gender : {
          comparison : '=',
          value : 'female'
        }
      }
    ]);
    expect(result).toEqual([testData[2], testData[3]]);
  });

  it("test id greater than 1 and less than 4", () => {
    const result = filter(testData, [
      {
        id : [
          {
            comparison : '>',
            value : 1
          },
          {
            comparison : '<',
            value : 4
          }
        ]
      }
    ]);
    expect(result).toEqual([testData[1], testData[2]]);
  });
});

describe('Selector methods', () => {
  it("using() method should set data", () => {
    const selector = filter.with([]);
    const result = selector.using(testData);
    expect(result.data).toEqual(testData);
  });

  it("executeFilter() should handle non-array data", () => {
    const selector = filter.with(testData);
    selector.equals('id', 1);
    const result = selector.executeFilter(testData[0]);
    expect(result).toEqual([testData[0]]);
  });

  it("filter() without arguments should return filters", () => {
    const selector = filter.with(testData);
    selector.equals('id', 1);
    const result = selector.filter();
    expect(result).toEqual(selector.filters);
  });

  it("filter() with argument should set filters", () => {
    const selector = filter.with(testData);
    const filters = [{
      id: {
        comparison: '=',
        value: 1
      }
    }];
    const result = selector.filter(filters);
    expect(result.filters).toEqual(filters);
  });

  it("count() with filters should return filtered count", () => {
    const result = filter.with(testData).equals('id', 1).count();
    expect(result).toEqual(1);
  });

  it("count() without filters should return total count", () => {
    const result = filter.with(testData).count();
    expect(result).toEqual(4);
  });
});

describe('with() chaining', () => {
  it("grouping test", () => {
    const result = filter.with(testData).group('gender').select();
    
    const expected = [...testData] as any;
    expected.groups = {
      gender : {
        male : [testData[0], testData[1]],
        female : [testData[2], testData[3]]
      }
    };
    
    expect(result).toEqual(expected);
  });

  it("grouping with filter", () => {
    const result = filter.with(testData).equals('id', 1).group('gender').select() as any;
    
    const expected = [testData[0]] as any;
    expected.groups = {
      gender : {
        male : [testData[0]]
      }
    };
    
    expect(result).toEqual(expected);
  });

  it("order by", () => {
    const result = filter.with(testData).sort('-id').select();
    expect(result).toEqual([testData[3], testData[2], testData[1], testData[0]]);
  });

  it("order by with coercion", () => {
    const result = filter.with(testData).sort('strNumber', Number).select();
    expect(result).toEqual([testData[3], testData[1], testData[2], testData[0]]);
  });

  it("multiple order by", () => {
    const result = filter.with(testData).sort('gender').sort('id').select();
    expect(result).toEqual([testData[2], testData[3], testData[0], testData[1]]);
  });
  
  it("sort() with no arguments should reset sort fields", () => {
    const selector = filter.with(testData).sort('id');
    expect(Object.keys(selector.sortFields).length).toBeGreaterThan(0);
    
    // Reset sort
    const result = selector.sort();
    expect(Object.keys(result.sortFields).length).toBe(0);
  });

  it("select column", () => {
    const result = filter.with(testData).select('name');
    expect(result).toEqual([
      { name: testData[0].name },
      { name: testData[1].name },
      { name: testData[2].name },
      { name: testData[3].name }
    ]);
  });

  it("equals('nullableField', null)", () => {
    const result = filter.with(testData).equals('nullableField', null).select();
    expect(result).toEqual([testData[0]]);
  });

  it("notEquals('nullableField', null)", () => {
    const result = filter.with(testData).notEquals('nullableField', null).select();
    expect(result).toEqual([testData[1], testData[2], testData[3]]);
  });

  it("equals('nullableField', null).or('')", () => {
    const result = filter.with(testData).equals('nullableField', null).or('').select();
    expect(result).toEqual([testData[0], testData[3]]);
  });

  it("starts('name','M')", () => {
    const result = filter.with(testData).starts('name', 'M').select();
    expect(result).toEqual([testData[2], testData[3]]);
  });

  it("starts('name','M').notEquals('family','wolf')", () => {
    const result = filter.with(testData).starts('name', 'M').notEquals('family', 'wolf').select();
    expect(result).toEqual([testData[2]]);
  });

  it("starts('name','M').equals('b','something').notEquals('family','wolf')", () => {
    const result = filter.with(testData).starts('name', 'M').equals('b', 'Something').notEquals('family', 'wolf').select();
    expect(result).toEqual([testData[2]]);
  });

  it("starts('name','M').contains('b','th').notEquals('family','wolf')", () => {
    const result = filter.with(testData).starts('name', 'M').contains('b', 'th').notEquals('family', 'wolf').select();
    expect(result).toEqual([testData[2]]);
  });

  it("equals('name','Dave').or().equals('gender','female')", () => {
    const result = filter.with(testData).equals('name', 'Dave').or().equals('gender', 'female').select();
    expect(result).toEqual([testData[1], testData[2], testData[3]]);
  });

  it("equals('name','Dave').or().equals('gender','female').equals('family', 'wolf')", () => {
    const result = filter.with(testData).equals('name', 'Dave').or().equals('gender', 'female').equals('family', 'wolf').select();
    expect(result).toEqual([testData[1], testData[3]]);
  });

  it("starts('name','D').notEquals('family', 'wolf')", () => {
    const result = filter.with(testData).starts('name', 'D').notEquals('family', 'wolf').select();
    expect(result).toEqual([]);
  });

  it("greaterThan('id',1).lessThan('id',4)", () => {
    const result = filter.with(testData).greaterThan('id', 1).lessThan('id', 4).select();
    expect(result).toEqual([testData[1], testData[2]]);
  });

  it("equals('id',1).or(2).or(3)", () => {
    const result = filter.with(testData).equals('id', 1).or(2).or(3).select();
    expect(result).toEqual([testData[0], testData[1], testData[2]]);
  });

  it("test sum()", () => {
    const result = filter.with(testData).sum('id');
    expect(result).toEqual(10);
  });
  
  it("test sum() with non-numeric values", () => {
    // Test with a mix of numeric and non-numeric values
    const mixedData = [
      { id: 1, value: "10" },
      { id: 2, value: "twenty" },
      { id: 3, value: null },
      { id: 4, value: "30" }
    ];
    
    const result = filter.with(mixedData).sum('value');
    expect(result).toEqual(40); // Only 10 and 30 should be summed
  });

  it("test max()", () => {
    const result = filter.with(testData).max('mosquitoBites');
    expect(result).toEqual(430);
  });

  it("test min()", () => {
    const result = filter.with(testData).min('mosquitoBites');
    expect(result).toEqual(98);
  });

  it("test avg()", () => {
    const result = filter.with(testData).avg('id');
    expect(result).toEqual(2.5);
  });

  it("test falsy()", () => {
    const result = filter.with(testData).falsy('nullableField').select();
    expect(result).toEqual([testData[0], testData[3]]);
  });

  it("test truthy()", () => {
    const result = filter.with(testData).truthy('nullableField').select();
    expect(result).toEqual([testData[1], testData[2]]);
  });

  it("test - falsey().greaterThan().or().truthy()", () => {
    const result = filter.with(testData).falsey('nullableField').greaterThan('id', 1).or().truthy('nullableField').select();
    expect(result).toEqual([testData[1], testData[2], testData[3]]);
  });

  it("test - truthy().or().falsey().greaterThan()", () => {
    const result = filter.with(testData).truthy('nullableField').or().falsey('nullableField').greaterThan('id', 1).select();
    expect(result).toEqual([testData[1], testData[2], testData[3]]);
  });

  it("test - truthy().or().falsey().greaterThan() - two", () => {
    const result = filter.with(testData).truthy('nullableField').or().falsey('nullableField').greaterThan('id', 0).select();
    expect(result).toEqual([testData[0], testData[1], testData[2], testData[3]]);
  });

  it("test deep field find", () => {
    const result = filter.with(testData).equals('child.name', 'Dan').select();
    expect(result).toEqual([testData[0]]);
  });

  it("test dates", () => {
    const result = filter.with(testData).greaterThan('birthdate', new Date('7/10/2013')).select();
    expect(result).toEqual([testData[1], testData[2]]);
  });

  it("test sorting mixed values including nulls", () => {
    const result = filter.with(testData).sort('nullableField').select();
    expect(result).toEqual([testData[0], testData[3], testData[1], testData[2]]);
  });
  
  it("test sorting with different null cases", () => {
    // Create test data with various null conditions for sorting
    const sortTestData = [
      { id: 1, val: "a" },
      { id: 2, val: null },
      { id: 3, val: "b" },
      { id: 4, val: null }
    ];
    
    // Test first value null, second value not null
    const result1 = filter.with(sortTestData).sort('val').select();
    expect(result1[0].val).toBeNull();
    expect(result1[1].val).toBeNull();
    
    // Test custom sort with null handling
    const customSortData = [
      { id: 1, val: "z" },
      { id: 2, val: null },
      { id: 3, val: "a" },
      { id: 4, val: null }
    ];
    
    const result2 = filter.with(customSortData).sort('-val').select();
    expect(result2[0].val).toBe("z");
    expect(result2[1].val).toBe("a");
    expect(result2[2].val).toBeNull();
    expect(result2[3].val).toBeNull();
  });

  it("code injection equals with sort", () => {
    const result = filter.with(testData).equals('foo`<%"\'{$*%\\', 'Dan').sort('foo`<%"\'{$*%\\').select();
    expect(result).toEqual([]);
  });
});