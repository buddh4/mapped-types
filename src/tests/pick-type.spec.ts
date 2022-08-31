import { expect } from '@jest/globals';
import { validate, Length } from 'class-validator';
import "reflect-metadata";
import { Exclude, Expose, instanceToPlain } from "class-transformer";
import { PickType } from "../pick-type.helper";

export class BaseClass {
  @Length(10)
  password: string;

  @Length(6)
  username: string;

  constructor(obj: Partial<BaseClass>) {
    Object.assign(this, obj);
  }
}

export class PickClass extends PickType(BaseClass, ['username']) {}

describe('PickType', () => {
  describe('constructor', function () {
    it('test constructor inheritance', async () => {
      const model = new PickClass({ username: 'test@test' });
      expect(model.username);
    });
  });

  describe('validation', function () {
    it('validation of inherited property works', async () => {
      let model = new PickClass({ username: 'short' });
      const validation = await validate(model);
      expect(validation.length).toEqual(1);
    });

    it('validation of omitted property skipped', async () => {
      let model = <any> new PickClass({ username: 'longerThan6' });
      model.password = '123';

      const validation = await validate(model);
      expect(validation.length).toEqual(0);
    });
  });

  describe('transformation', function () {
    it('simple transformation', async () => {
      class A { field: string; fieldB: string }

      class PickA extends PickType(A, ['field']) {}

      const ab = new PickA();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({ field: 'test' });
    });

    it('exclude field', async () => {
      class A { @Exclude() field: string; fieldB: string }

      class PickA extends PickType(A, ['field']) {}

      const ab = new PickA();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({});
    });

    it('exclude field', async () => {
      class A { @Expose() field: string; fieldB: string }

      class PickA extends PickType(A, ['field']) {}

      const ab = new PickA();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({field: 'test'});
    });
  });
});
