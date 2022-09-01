import { Type } from "./type.interface";

import {
  applyIsOptionalDecorator, getValidationFields,
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
  const RefClass = classRef as any;
  abstract class PartialTypeClass extends RefClass {}

  getValidationFields(classRef).forEach((key) => applyIsOptionalDecorator(PartialTypeClass, key));
  return PartialTypeClass as Type<Partial<T>>;
}
