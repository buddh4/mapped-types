import 'reflect-metadata'
import { Type } from "./type.interface";
import * as classValidator from 'class-validator';
import { getMetadataStorage } from "class-validator";
import { isBrowser } from "./is-browser.utils";

export function applyIsOptionalDecorator(
  targetClass: Function,
  propertyKey: string,
) {
  if (!isClassValidatorAvailable()) {
    return;
  }
  const decoratorFactory = classValidator.IsOptional();
  decoratorFactory(targetClass.prototype, propertyKey);
}

export function inheritPropertyInitializers(
  target: Record<string, any>,
  sourceClass: Type<any>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  args = [],
  isPropertyInherited = (key: string) => true,
) {
  try {
    const tempInstance = new sourceClass(...args);
    const propertyNames = Object.getOwnPropertyNames(tempInstance);

    propertyNames
      .filter(
        (propertyName) =>
          typeof tempInstance[propertyName] !== 'undefined' &&
          typeof target[propertyName] === 'undefined',
      )
      .filter((propertyName) => isPropertyInherited(propertyName))
      .forEach((propertyName) => {
        target[propertyName] = tempInstance[propertyName];
      });
  } catch {
    // Nothing todo...
  }
}


export function inheritValidationMetadata(
  parentClass: Type,
  targetClass: Function,
  isPropertyInherited?: (key: string) => boolean,
) {
  if (!isClassValidatorAvailable()) {
    return;
  }
  const metadataStorage: classValidator.MetadataStorage = (
    classValidator as any
  ).getMetadataStorage
    ? (classValidator as any).getMetadataStorage()
    : classValidator.getFromContainer(classValidator.MetadataStorage);

  const getTargetValidationMetadatasArgs = [parentClass, null!, false, false];
  const targetMetadata: ReturnType<typeof metadataStorage.getTargetValidationMetadatas> = (metadataStorage.getTargetValidationMetadatas as Function)(
    ...getTargetValidationMetadatasArgs,
  );
  return targetMetadata
    .filter(
      ({propertyName}) =>
        !isPropertyInherited || isPropertyInherited(propertyName),
    )
    .map((value) => {
      const originalType = Reflect.getMetadata(
        'design:type',
        parentClass.prototype,
        value.propertyName,
      );
      if (originalType) {
        Reflect.defineMetadata(
          'design:type',
          originalType,
          targetClass.prototype,
          value.propertyName,
        );
      }

      metadataStorage.addValidationMetadata({
        ...value,
        target: targetClass,
      });
      return value.propertyName;
    });
}

type TransformMetadataKey =
  | '_excludeMetadatas'
  | '_exposeMetadatas'
  | '_typeMetadatas'
  | '_transformMetadatas';

export function inheritTransformationMetadata(
  parentClass: Type<any>,
  targetClass: Function,
  isPropertyInherited?: (key: string) => boolean,
) {
  if (!isClassTransformerAvailable()) {
    return;
  }
  const transformMetadataKeys: TransformMetadataKey[] = [
    '_excludeMetadatas',
    '_exposeMetadatas',
    '_transformMetadatas',
    '_typeMetadatas',
  ];
  transformMetadataKeys.forEach((key) =>
    inheritTransformerMetadata(
      key,
      parentClass,
      targetClass,
      isPropertyInherited,
    ),
  );
}

function inheritTransformerMetadata(
  key: TransformMetadataKey,
  parentClass: Type<any>,
  targetClass: Function,
  isPropertyInherited?: (key: string) => boolean,
) {

  if(isBrowser()) {
    return;
  }

  let classTransformer: any;
  try {
    /** "class-transformer" >= v0.3.x */
    classTransformer = require('class-transformer/cjs/storage');
  } catch {
  }
  const metadataStorage /*: typeof import('class-transformer/types/storage').defaultMetadataStorage */ =
    classTransformer.defaultMetadataStorage;

  while (parentClass && parentClass !== Object) {
    if (metadataStorage[key].has(parentClass)) {
      const metadataMap = metadataStorage[key] as Map<Function,
        Map<string, any>>;
      const parentMetadata = metadataMap.get(parentClass);

      const targetMetadataEntries: Iterable<[string, any]> = Array.from(
        parentMetadata!.entries(),
      )
        .filter(([key]) => !isPropertyInherited || isPropertyInherited(key))
        .map(([key, metadata]) => {
          if (Array.isArray(metadata)) {
            // "_transformMetadatas" is an array of elements
            const targetMetadata = metadata.map((item) => ({
              ...item,
              target: targetClass,
            }));
            return [key, targetMetadata];
          }
          return [key, {...metadata, target: targetClass}];
        });

      if (metadataMap.has(targetClass)) {
        const existingRules = metadataMap.get(targetClass)!.entries();
        metadataMap.set(
          targetClass,
          new Map([...existingRules, ...targetMetadataEntries]),
        );
      } else {
        metadataMap.set(targetClass, new Map(targetMetadataEntries));
      }
    }
    parentClass = Object.getPrototypeOf(parentClass);
  }
}

function isClassValidatorAvailable() {
  try {
    require('class-validator');
    return true;
  } catch {
    return false;
  }
}

function isClassTransformerAvailable() {
  try {
    require('class-transformer');
    return true;
  } catch {
    return false;
  }
}

export function getValidationFields<T>(type: Type<T>) {
  const validationMetas = getMetadataStorage().getTargetValidationMetadatas(type, type.name, true, false);
  return validationMetas?.map(meta => meta.propertyName) || [];
}

