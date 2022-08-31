import { Type } from "./type.interface";

import {
  applyIsOptionalDecorator, getValidationFields,
  inheritTransformationMetadata,
  inheritValidationMetadata
} from './type-helpers.utils';

/**
 * This is a modified version of the original PartialType of @nestjs/swagger. This version was modified in order to
 * support actual inheritance between the classRef argument and the resulting partial class and furthermore removed
 * swagger related dependencies and logic.
 *
 * @param classRef
 * @constructor
 */
export function PartialType<T>(classRef: Type<T>): Type<Partial<T>> {
  const RefClass = <any> classRef;
  abstract class PartialTypeClass extends RefClass {}

  inheritValidationMetadata(classRef, PartialTypeClass);
  inheritTransformationMetadata(classRef, PartialTypeClass);

  getValidationFields(classRef).forEach((key) => applyIsOptionalDecorator(PartialTypeClass, key));
  return PartialTypeClass as Type<Partial<T>>;
}
