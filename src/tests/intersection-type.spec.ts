import { PartialType } from "../partial-type.helper";
import { expect } from '@jest/globals';
import { validate, IsEmail, Length, IsOptional, IsString } from 'class-validator';
import "reflect-metadata";
import { IntersectionType } from "../intersection-type.helper";
import { Exclude, Expose, instanceToPlain } from "class-transformer";

class ClassA {

  @IsEmail()
  @IsOptional()
  email: string;

  @Length(15)
  @IsOptional()
  baseField: string;

  getTest() {
    return 'test';
  }

  constructor(obj: Partial<ClassA>) {
    Object.assign(this, obj);
  }
}

class ClassB {

  @Exclude()
  @IsOptional()
  @Length(20)
  email: string;

  @IsOptional()
  @Length(15)
  extraField: string;
}

export class InterSectionClass extends IntersectionType(ClassA, ClassB) {}

describe('PartialType', () => {
  describe('constructor', function () {
    it('test intersection field', async () => {
      const model = new InterSectionClass({ email: 'test@test.de' });
      expect(model.email).toEqual('test@test.de');
    });

    it('test intersection field', async () => {
      const model = new InterSectionClass({ baseField: 'baseField' });
      expect(model.baseField).toEqual('baseField');
    });

    it('test extra field', async () => {
      const model = new InterSectionClass({ extraField: 'extraField' });
      expect(model.extraField).toEqual('extraField');
    });

  });

  describe('validation', function () {
    it('test intersection validation rule of base class', async () => {
      const model = new InterSectionClass({ email: 'notAnEmailButLongerThan20Chars' });
      const validation = await validate(model);
      expect(validation.length).toEqual(1);
      expect(validation[0].property).toEqual('email');
    });

    it('test intersection validation rule of second class', async () => {
      const model = new InterSectionClass({ email: 'test@test.de' });
      const validation = await validate(model);
      expect(validation.length).toEqual(1);
      expect(validation[0].property).toEqual('email');
    });

    it('test validation of base field', async () => {
      const model = new InterSectionClass({ baseField: 'tooShort' });
      const validation = await validate(model);
      expect(validation.length).toEqual(1);
      expect(validation[0].property).toEqual('baseField');
    });

    it('test validation of base field', async () => {
      const model = new InterSectionClass({ extraField: 'tooShort' });
      const validation = await validate(model);
      expect(validation.length).toEqual(1);
      expect(validation[0].property).toEqual('extraField');
    });
  });

  describe('transformation', function () {
    it('no class sets exclude', async () => {
      class A { field: string }
      class B { field: string }

      class AB extends IntersectionType(A,B) {}

      const ab = new AB();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({ field: 'test' });
    });

    it('second class sets exclude', async () => {
      class A { field: string }
      class B { @Exclude() field: string }

      class AB extends IntersectionType(A,B) {}

      const ab = new AB();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({});
    });

    it('first class sets exclude', async () => {
      class A { @Exclude() field: string }
      class B { field: string }

      class AB extends IntersectionType(A,B) {}

      const ab = new AB();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({});
    });

    it('second class can not overwrite exclude', async () => {
      class A { @Exclude() field: string }
      class B { @Expose() field: string }

      class AB extends IntersectionType(A,B) {}

      const ab = new AB();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({});
    });

    it('first class can not overwrite exclude', async () => {
      class A { @Expose() field: string }
      class B { @Exclude() field: string }

      class AB extends IntersectionType(A,B) {}

      const ab = new AB();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({});
    });

    it('first exposes a field', async () => {
      class A { @Expose() field: string }
      class B { field: string }

      @Exclude()
      class AB extends IntersectionType(A,B) {}

      const ab = new AB();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({ field: 'test' });
    });

    it('second exposes a field', async () => {
      class A { field: string }
      class B { @Expose()  field: string }

      @Exclude()
      class AB extends IntersectionType(A,B) {}

      const ab = new AB();
      ab.field = 'test';

      const plainAb = instanceToPlain(ab);
      expect(plainAb).toEqual({ field: 'test' });
    });
  });
});
