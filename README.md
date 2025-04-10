# node-aloof [![Build Status](https://secure.travis-ci.org/wankdanker/node-aloof.png)](http://travis-ci.org/wankdanker/node-aloof)

Array Of Objects Filtering. I don't know what the 'l' is for.

## Installation

```bash
npm install aloof
# or
pnpm add aloof
# or
yarn add aloof
```

## Usage

```typescript
import filter from 'aloof';

// Sample data
const data = [
  { id: 1, name: 'John', gender: 'male' },
  { id: 2, name: 'Jane', gender: 'female' },
  { id: 3, name: 'Bob', gender: 'male' }
];

// Basic filtering
const males = filter(data, {
  gender: {
    comparison: '=',
    value: 'male'
  }
});
// Result: [{ id: 1, name: 'John', gender: 'male' }, { id: 3, name: 'Bob', gender: 'male' }]

// Chaining with method syntax
const result = filter.with(data)
  .equals('gender', 'female')
  .select('name');
// Result: [{ name: 'Jane' }]

// Multiple conditions (AND)
const complexFilter = filter.with(data)
  .greaterThan('id', 1)
  .equals('gender', 'male')
  .select();
// Result: [{ id: 3, name: 'Bob', gender: 'male' }]

// OR conditions
const orFilter = filter.with(data)
  .equals('name', 'John')
  .or()
  .equals('name', 'Jane')
  .select();
// Result: [{ id: 1, name: 'John', gender: 'male' }, { id: 2, name: 'Jane', gender: 'female' }]
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