import { PartialType } from "../partial-type.helper";
import { expect } from '@jest/globals';
import { validate, IsEmail, MinLength } from 'class-validator';
import "reflect-metadata";
import { IntersectionType } from "../intersection-type.helper";
import { Exclude, Expose, instanceToPlain } from "class-transformer";

export class BaseClass {

  @IsEmail()
  email: string;

  getBase() {
    return 'base';
  }

  constructor(obj: Partial<CreateUserDto>) {
    Object.assign(this, obj);
  }
}

export class CreateUserDto extends BaseClass {

  @MinLength(10)
  password: string;

  getTest() {
    return 'test';
  }
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

describe('PartialType', () => {
  describe('constructor', function () {
    it('test constructor inheritance', async () => {
      const model = new UpdateUserDto({ email: 'test@test' });
      expect(typeof model.getTest).toEqual('function');
      expect(model.getTest()).toEqual('test');
    });

    it('test base class inheritance', async () => {
      const model = new UpdateUserDto({ email: 'test@test' });
      expect(typeof model.getBase).toEqual('function');
      expect(model.getBase()).toEqual('base');
    });
  });

  describe('validate', function () {
    it('test all fields are optional', async () => {
      const model = new UpdateUserDto();
      const validation = await validate(model);
      expect(validation.length).toEqual(0);
    });

    it('test partial type constructor', async () => {
      const model = new UpdateUserDto({ email: 'test@test.de' });
      expect(model.email).toEqual('test@test.de');
      const validation = await validate(model);
      expect(validation.length).toEqual(0);
    });

    it('test invalid optional field', async () => {
      const model = new UpdateUserDto({ email: 'test@test' });
      const validation = await validate(model);
      expect(validation.length).toEqual(1);
    });
  });

  describe('transformation', function () {
    it('simple transformation', async () => {
      class A { field: string }

      class PartialA extends PartialType(A) {}

      const ab = new PartialA();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({field: 'test'});
    });

    it('exclude field', async () => {
      class A { @Exclude() field: string }

      class PartialA extends PartialType(A) {}

      const ab = new PartialA();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({});
    });

    it('exclude field', async () => {
      class A { @Expose() field: string }

      @Exclude()
      class PartialA extends PartialType(A) {}

      const ab = new PartialA();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({field: 'test'});
    });
  });
});
