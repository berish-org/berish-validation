import * as collection from 'berish-collection';
import { LINQ } from 'berish-linq';

export type KeyType = string | number | symbol;

export interface ISchemaArgs {
  [argName: string]: any;
}
export interface ISchemaFilter {
  id: KeyType;
  args: ISchemaArgs;
}
/**
 * Может быть только 1 уровень вложенности. Отвечает за локальный уровень и его данные
 * Ключом является наименование поля в объекте, например, user.name - где name наименование поля (ключ).
 * Значением является идентификатор, отображающий к какому фильтру относится это поле.
 * Пример: ```name: [SYMBOL_IS_REQUIRED, SYMBOL_IS_PHONE]```
 */
export interface ISchema {
  [propertyKey: string]: ISchemaFilter[];
}

export function prepare(obj: ISchema, propertyName?: string) {
  if (!obj) obj = {};
  if (propertyName != null) {
    obj[propertyName] = obj[propertyName] || [];
  }
  return obj;
}

export function addFilter(obj: ISchema, propertyName: string, filter: KeyType, args?: ISchemaArgs) {
  obj = prepare(obj, propertyName);
  if (filter) {
    const schemaFilter = obj[propertyName];
    const index = schemaFilter.map(m => m.id).indexOf(filter);
    if (index === -1) {
      schemaFilter.push({
        args: args || {},
        id: filter,
      });
    } else {
      schemaFilter[index].args = Object.assign({}, schemaFilter[index].args || {}, args);
    }
  }
  return obj;
}

export function removeFilter(obj: ISchema, propertyName: string, filter: KeyType) {
  obj = prepare(obj, propertyName);
  if (filter) {
    const schemaFilter = obj[propertyName];
    const index = schemaFilter.map(m => m.id).indexOf(filter);
    if (index !== -1) schemaFilter.splice(index, 1);
  }
  return obj;
}

export function hasFilter(obj: ISchema, propertyName: string, filter: KeyType) {
  obj = prepare(obj, propertyName);
  if (filter) {
    const schemaFilter = obj[propertyName];
    const index = schemaFilter.map(m => m.id).indexOf(filter);
    if (index !== -1) return true;
  }
  return false;
}

export function findLocalFilters(obj: ISchema, propertyName?: string) {
  obj = prepare(obj, propertyName);
  const keys = propertyName != null ? [propertyName] : Object.keys(obj);
  const kvs = LINQ.fromArray(keys)
    .select(key => new collection.KeyValuePair(key, obj[key]))
    .toArray();
  return collection.Dictionary.fromArray(kvs);
}
