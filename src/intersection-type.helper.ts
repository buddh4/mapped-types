import { Type } from "./type.interface";
import {
  inheritTransformationMetadata,
  inheritValidationMetadata,
  inheritPropertyInitializers,
} from './type-helpers.utils';


export function IntersectionType<A, B>(
  classARef: Type<A>,
  classBRef: Type<B>
): Type<A & B> {

  const ClassA = <any> classARef;

  abstract class IntersectionTypeClass extends ClassA {
    constructor(...args) {
      super(...args);
      inheritPropertyInitializers(this, classBRef);
    }
  }

  inheritValidationMetadata(classARef, IntersectionTypeClass);
  inheritTransformationMetadata(classARef, IntersectionTypeClass);
  inheritValidationMetadata(classBRef, IntersectionTypeClass);
  inheritTransformationMetadata(classBRef, IntersectionTypeClass);

  Object.defineProperty(IntersectionTypeClass, 'name', {
    value: `Intersection${classARef.name}${classBRef.name}`
  });

  return IntersectionTypeClass as Type<A & B>;
}
