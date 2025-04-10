# node-aloof

**A**rray **L**ogical **O**bject **O**riented **F**iltering - A powerful TypeScript library for filtering arrays of objects with a fluent, chainable API.

## Installation

```bash
npm install aloof
# or
pnpm add aloof
# or
yarn add aloof
```

## Usage

### Basic Filtering

```typescript
import filter from 'aloof';

// Sample data
const data = [
  { id: 1, name: 'John', gender: 'male', age: 28 },
  { id: 2, name: 'Jane', gender: 'female', age: 32 },
  { id: 3, name: 'Bob', gender: 'male', age: 22 }
];

// Simple equality filter
const males = filter(data, {
  gender: {
    comparison: '=',
    value: 'male'
  }
});
// Result: [{ id: 1, name: 'John', gender: 'male', age: 28 }, { id: 3, name: 'Bob', gender: 'male', age: 22 }]
```

### Chainable API

```typescript
// Using the chainable API with method syntax
const result = filter.with(data)
  .equals('gender', 'female')
  .select('name');
// Result: [{ name: 'Jane' }]

// Multiple conditions (AND)
const youngMales = filter.with(data)
  .equals('gender', 'male')
  .lessThan('age', 25)
  .select();
// Result: [{ id: 3, name: 'Bob', gender: 'male', age: 22 }]

// OR conditions
const johnsOrFemales = filter.with(data)
  .equals('name', 'John')
  .or()
  .equals('gender', 'female')
  .select();
// Result: [{ id: 1, name: 'John', gender: 'male', age: 28 }, { id: 2, name: 'Jane', gender: 'female', age: 32 }]
```

### Comparison Operators

Aloof supports numerous comparison operators:

- `equals` (`==`): Equality check
- `notEquals` (`!=`): Inequality check
- `starts`: Checks if string starts with value
- `ends`: Checks if string ends with value
- `contains`: Checks if string contains value
- `match`: Regex match
- `greater`/`greaterThan` (`>`): Greater than
- `greaterEquals`/`greaterThanEquals` (`>=`): Greater than or equal
- `less`/`lessThan` (`<`): Less than
- `lessEquals`/`lessThanEquals` (`<=`): Less than or equal
- `between`: Between two values (exclusive)
- `betweenEquals`: Between two values (inclusive)
- `outside`: Outside two values (exclusive)
- `outsideEquals`: Outside two values (inclusive)
- `truthy`: Checks if value is truthy
- `falsy`/`falsey`: Checks if value is falsy
- `in`: Checks if value is in array or string

```typescript
// Examples
filter.with(data).greaterThan('age', 25).select(); // Age > 25
filter.with(data).betweenEquals('age', 20, 30).select(); // 20 <= Age <= 30
filter.with(data).in('id', [1, 3]).select(); // id in [1, 3]
filter.with(data).starts('name', 'J').select(); // Name starts with J
```

### Projection (Select)

Select specific fields from the filtered results:

```typescript
const names = filter.with(data)
  .equals('gender', 'male')
  .select('name', 'age');
// Result: [{ name: 'John', age: 28 }, { name: 'Bob', age: 22 }]
```

### Sorting

Sort the filtered results:

```typescript
// Ascending sort
const ascending = filter.with(data)
  .sort('age')
  .select();
// Result: [{ id: 3, ... age: 22 }, { id: 1, ... age: 28 }, { id: 2, ... age: 32 }]

// Descending sort (prefix with -)
const descending = filter.with(data)
  .sort('-age')
  .select();
// Result: [{ id: 2, ... age: 32 }, { id: 1, ... age: 28 }, { id: 3, ... age: 22 }]

// Multiple sort fields
const multiSort = filter.with(data)
  .sort('gender', 'age')
  .select();
// Sorts by gender, then by age

// With coercion
const coercedSort = filter.with(data)
  .sort('age', Number)
  .select();
// Coerces values to numbers before sorting
```

### Grouping

Group data by a specific field:

```typescript
const grouped = filter.with(data)
  .group('gender')
  .select();

// Result will include a groups property:
// grouped.groups = {
//   gender: {
//     male: [{ id: 1, ... }, { id: 3, ... }],
//     female: [{ id: 2, ... }]
//   }
// }
```

### Aggregation Functions

```typescript
// Count records
const count = filter.with(data).equals('gender', 'male').count();
// Result: 2

// Sum values
const totalAge = filter.with(data).sum('age');
// Result: 82 (28 + 32 + 22)

// Average
const avgAge = filter.with(data).avg('age');
// Result: 27.33...

// Min/Max values
const minAge = filter.with(data).min('age'); // 22
const maxAge = filter.with(data).max('age'); // 32
```

### Nested Properties

Access nested object properties with dot notation:

```typescript
const nested = [
  { id: 1, profile: { name: 'John', gender: 'male' } },
  { id: 2, profile: { name: 'Jane', gender: 'female' } }
];

const result = filter.with(nested)
  .equals('profile.name', 'John')
  .select();
// Result: [{ id: 1, profile: { name: 'John', gender: 'male' } }]
```

## TypeScript Support

This library is written in TypeScript and provides type definitions out of the box.

## Development

### Building

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Build with watch mode
npm run build:watch
```

### Testing

Tests are run using Vitest:

```bash
# Run tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck
```

## License

MIT