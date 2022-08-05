# type-graphql-utils
[![npm version](https://img.shields.io/npm/v/type-graphql-utils)](https://www.npmjs.com/package/type-graphql-utils)
[![npm downloads](https://img.shields.io/npm/dm/type-graphql-utils.svg)](https://www.npmjs.com/package/type-graphql-utils)
[![Known Vulnerabilities](https://snyk.io/test/github/chrislahaye/type-graphql-utils/badge.svg)](https://snyk.io/test/github/chrislahaye/type-graphql-utils)

This module provides utilities to transform [type-graphql](https://www.npmjs.com/package/type-graphql) types.

## Install

```shell
yarn install type-graphql-utils
```

## Usage

```ts
import { Field, InputType, ObjectType } from 'type-graphql';
import { Pick, Partial } from 'type-graphql-utils';

@ObjectType()
class User {
  @Field()
  id!: number;

  @Field()
  name!: string;

  @Field()
  email!: string;
}
```

```
type User {
  id: String!
  name: String!
  email: String!
}
```

```ts
@InputType()
class UserInput1 extends Partial(User) {
  // extra fields
}
```

```
input UserInput1 {
  id: String
  name: String
  email: String
}
```

```ts
@InputType()
class UserInput2 extends Pick(User, { name: 1 }) { }
```

```
input UserInput2 {
  name: String!
}
```

```ts
@InputType()
class UserInput3 extends Required(Partial(User), { id: 1 }) {}
```

```
input UserInput3 {
  id: String!
  name: String
  email: String
}
```

## API

**`BaseClass`**: The type to transform. A class decorated with `@InputType()` or `@ObjectType()`.

**`names`**: The fields to transform. A potentially optional object containing the names of the fields as key, e.g. `{ id: 1, name: 1 }`. The TypeScript type enforces all values to be *1*, but the value isn't actually used. We just need the names as object to determine if a name is included in constant time.

### `Pick(BaseClass, names)`

Constructs a type by picking the keys of `names` from `BaseClass`.

### `Omit(BaseClass, names)`

Constructs a type by picking all fields from `BaseClass` and then removing the keys of `names`.

### `Partial(BaseClass, [names])`

Constructs a type by picking all fields from `BaseClass` and then setting the keys of `names` to optional. The opposite of Required. By default, `names` contains all names.

### `Required(BaseClass, [names])`

Constructs a type by picking all fields from `BaseClass` and then setting the keys of `names` to required. The opposite of Partial. By default, `names` contains all names.
