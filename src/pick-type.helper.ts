import { Type } from "./type.interface";
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata
} from "./type-helpers.utils";

export function PickType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[]
): Type<Pick<T, typeof keys[number]>> {

  const isInheritedPredicate = (propertyKey: string) => keys.includes(propertyKey as K);

  abstract class PickTypeClass {
    constructor(...args) {
      inheritPropertyInitializers(this, classRef, args, isInheritedPredicate);
    }
  }

  inheritValidationMetadata(classRef, PickTypeClass, isInheritedPredicate);
  inheritTransformationMetadata(classRef, PickTypeClass, isInheritedPredicate);

  return PickTypeClass as Type<Pick<T, typeof keys[number]>>;
}
