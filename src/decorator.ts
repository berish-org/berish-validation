import { KEY_SELF } from './const';
import { FilterModel } from './filterModel';
import * as modelSchema from './modelSchema';
import { ISchemaArgs, KeyType } from './schema';

// tslint:disable-next-line:ban-types
export type DecoratorClassType = <T extends new (...args: any[]) => {}>(constructor: T) => T | void;

export type DecoratorPropertyType = (
  target: any,
  propertyKey: KeyType,
  descriptor: TypedPropertyDescriptor<any>,
) => TypedPropertyDescriptor<any>;

export function createPropertyDecorator(filterModel: FilterModel, args: ISchemaArgs): DecoratorPropertyType {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    const oldSet = descriptor.set!;
    const oldGet = descriptor.get!;
    descriptor.set = function(value: any) {
      const id = filterModel && filterModel.id;
      if (id != null && !modelSchema.hasFilter(this, propertyKey, id))
        modelSchema.addFilter(this, propertyKey, id, args);
      oldSet.call(this, value);
    };
    descriptor.get = function() {
      const id = filterModel && filterModel.id;
      if (id != null && !modelSchema.hasFilter(this, propertyKey, id))
        modelSchema.addFilter(this, propertyKey, id, args);
      return oldGet.call(this);
    };
    return descriptor;
  };
}

export function createClassDecorator(filterModel: FilterModel, args: ISchemaArgs): DecoratorClassType {
  return constructor => {
    const id = filterModel && filterModel.id;
    if (id != null && !modelSchema.hasFilter(constructor, KEY_SELF, id))
      modelSchema.addFilter(constructor, KEY_SELF, id, args);
    return constructor;
  };
}

export function Property(...decorators: DecoratorPropertyType[]) {
  return function(target: any, key: string) {
    const SYMBOL_PROPERTY = Symbol(key || 'property');
    let descriptor = Object.getOwnPropertyDescriptor(target, key) || {};
    delete target[key];
    descriptor.set = function(val) {
      this[SYMBOL_PROPERTY] = val;
    };
    descriptor.get = function() {
      return this[SYMBOL_PROPERTY];
    };
    for (const dec of decorators) {
      descriptor = dec(target, key, descriptor);
    }
    Object.defineProperty(target, key, descriptor);
  };
}
