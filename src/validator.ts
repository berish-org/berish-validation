import * as collection from 'berish-collection';
import { LINQ } from 'berish-linq';
import * as ringle from 'berish-ringle';

import { KEY_SELF } from './const';
import { FilterModel } from './filterModel';
import * as modelSchema from './modelSchema';

class Validator {
  private _filters: FilterModel[] = [];

  public register(filter: FilterModel) {
    const index = this._filters.indexOf(filter);
    if (index === -1) {
      this._filters.push(filter);
    }
  }

  public unregister(filter: FilterModel) {
    const index = this._filters.indexOf(filter);
    if (index !== -1) {
      this._filters = this._filters.filter(m => m !== filter);
    }
  }

  public scope(scope?: string | number | symbol) {
    return ringle.getSingleton(Validator, scope);
  }

  get filters() {
    return LINQ.fromArray(this._filters);
  }

  public validateClass(obj: any) {
    return this.validateLocal(obj, KEY_SELF);
  }

  public async validateLocal(obj: any, propertyKey?: string) {
    if (!obj) return null;
    obj = modelSchema.prepare(obj, propertyKey);
    if (!obj) return new collection.Dictionary<string, number[]>();
    const filters = modelSchema.findLocalFilters(obj, propertyKey);
    const results = filters
      .toLinq()
      .select(async m => {
        const propertyName = m.key;
        const propertyValue = propertyName === KEY_SELF ? obj : obj[propertyName];
        const intersectionFilters = LINQ.fromArray(m.value)
          .select(k => ({ filterModel: this.filters.firstOrNull(l => l.id === k.id), args: k.args || {} }))
          .notNull();
        const conditionsResults = await Promise.all(
          intersectionFilters
            .select(async item => {
              const { filterModel, args } = item;
              const conditionObject = {
                key: propertyName,
                obj,
                value: propertyValue,
                ...filterModel.conditionObject,
                ...args,
              };
              const result = await filterModel.condition(conditionObject);
              return {
                filterModel,
                result,
              };
            })
            .toArray(),
        );

        const errorCodes = LINQ.fromArray(conditionsResults)
          .where(m => !m.result)
          .select(m => m.filterModel.errorCode)
          .toArray();
        return new collection.KeyValuePair(propertyName, errorCodes);
      })
      .toArray();
    const promisingArray = await Promise.all(results);
    return collection.Dictionary.fromArray(promisingArray);
  }
}

export default ringle.getSingleton(Validator);
