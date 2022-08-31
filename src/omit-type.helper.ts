import { Type } from "./type.interface";
import {
  inheritPropertyInitializers,
  inheritTransformationMetadata,
  inheritValidationMetadata
} from "./type-helpers.utils";

export function OmitType<T, K extends keyof T>(
  classRef: Type<T>,
  keys: readonly K[]
): Type<Omit<T, typeof keys[number]>> {
  const isInheritedPredicate = (propertyKey: string) => !keys.includes(propertyKey as K);

  abstract class OmitTypeClass {
    constructor(...args) {
      inheritPropertyInitializers(this, classRef, args, isInheritedPredicate);
    }
  }

  inheritValidationMetadata(classRef, OmitTypeClass, isInheritedPredicate);
  inheritTransformationMetadata(classRef, OmitTypeClass, isInheritedPredicate);

  return OmitTypeClass as Type<Omit<T, typeof keys[number]>>;
}
