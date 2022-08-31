# Description

This library provides mapped types for creating dynamic model classes and [class-validator](https://github.com/typestack/class-validator) validation schemas with
the help of following classes:

- `PartialType`: Sets all validation schema fields of a given type to `@IsOptional`
- `IntersectionType`: Combines two classes and their validation schema
- `OmitType`: Omits certain fields and validations from an existing class
- `PickType`: Picks certain fields with validation schema from an existing class

This library is heavily based on the implementation of the [@nestjs/swagger](https://github.com/nestjs/swagger)
module but contains some modifications as:

- Removed all `nestjs` dependencies and `nestjs/swagger` related metadata code
- Use of real inheritance in `PartialType` and `IntersectionType`, as opposed to property only inheritance
- Pass constructor arguments to inherited constructor

# Usage

The provided type helper classes can be used to create subclasses with altered validation schemas, without the need
of redefining all properties of a class.

## PartialType

With the `PartialType` helper, we can create a subclass which automatically adds an `@IsOptional` decorator to all
properties of the base class.

```typescript
import { IsString } from 'class-validator';
import { PartialType } from '@buddh4/mapped-types';

class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  text;
}

class UpdateArticelDto extends PartialType(CreateDto) {}
```

**Notes:**

- Only properties which do have a validation rule in the base class will be attached with an `@IsOptional` rule.
- The created subclass will inherit all functions, this behavior differs from the original `nestjs/swagger` implementation. 

## OmitType

With the `OmitType` you can create a subclass which omits all selected fields and their validations.

```typescript
import { IsString } from 'class-validator';
import { OmitType } from '@buddh4/mapped-types';

class UserDto {
  @IsString()
  username: string;

  @IsString()
  password;
}

class UserInfoDto extends OmitType(CreateDto, ['password']) {}
```

**Notes:**

- The `OmitType` does not inherit any class functions, only properties.

## PickType

The `PickType` behaves similar to the `OmitType` but instead of excluding certain fields it only includes the selected
fields.

```typescript
import { IsString } from 'class-validator';
import { PickType } from '@buddh4/mapped-types';

class UserDto {
  @IsString()
  username: string;

  @IsString()
  password;
}

class UserInfoDto extends PickType(CreateDto, ['username']) {}
```

**Notes:**

- The `PickType` does not inherit any class functions, only properties.

## IntersectionType

The `IntersectionType` can be used to merge the properties and their validation schema into a single subclass.

```typescript
import { IsString } from 'class-validator';
import { IntersectionType } from '@buddh4/mapped-types';

class UserDto {
  @IsString()
  username: string;
}

class UserInfoDto {
  @Length(15)
  username: string;
}

class UserFormDto extends InterSectionType(UserDto, UserInfoDto) {}
```

**Note:**

- The `IntersectionType` will only inherit functions and the constructor from the first provided class but not the
second one. So only the fields and validation schema of the second class will be merged into the resulting class.
- If one class of an `IntersectionType` sets an `@Exclude` on a field, the other class is not able to overwrite
it with an `@Expose`.


## Additional Notes

## Class level Exclude and Expose are ignored

You need to manually set `@Expose` or `@Exclude` on the newly created types if required.
