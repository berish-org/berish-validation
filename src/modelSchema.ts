import { SYMBOL_SCHEMA } from './const';
import * as schema from './schema';

function isObject(obj: any): obj is object {
  return typeof obj === 'object' && obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';
}

export function prepare(obj: any, propertyName?: string) {
  if (!obj) return null;
  if (!isObject(obj) && typeof obj !== 'function') return null;
  obj[SYMBOL_SCHEMA] = schema.prepare(obj[SYMBOL_SCHEMA], propertyName);
  return obj;
}

export function addFilter(obj: any, propertyName: string, filter: schema.KeyType, args: schema.ISchemaArgs) {
  obj = prepare(obj, propertyName);
  schema.addFilter(obj[SYMBOL_SCHEMA], propertyName, filter, args);
  return obj;
}

export function removeFilter(obj: any, propertyName: string, filter: schema.KeyType) {
  obj = prepare(obj, propertyName);
  schema.removeFilter(obj[SYMBOL_SCHEMA], propertyName, filter);
  return obj;
}

export function hasFilter(obj: any, propertyName: string, filter: schema.KeyType) {
  obj = prepare(obj, propertyName);
  return schema.hasFilter(obj[SYMBOL_SCHEMA], propertyName, filter);
}

export function findLocalFilters(obj: any, propertyName?: string) {
  obj = prepare(obj, propertyName);
  return schema.findLocalFilters(obj[SYMBOL_SCHEMA], propertyName);
}
