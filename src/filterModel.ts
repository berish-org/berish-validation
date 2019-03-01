import guid from 'berish-guid';
import { SYMBOL_FILTER_MODEL_CONDITION } from './const';
import * as decorator from './decorator';
import { KeyType } from './schema';
import validator from './validator';

export interface IConditionObject {
  value?: any;
  obj?: any;
  key?: KeyType;
  [key: string]: any;
  [index: number]: any;
}

export type ConditionType<TConditionObject extends IConditionObject> = (
  obj: TConditionObject,
) => boolean | Promise<boolean>;

export class FilterModel<TConditionObject extends IConditionObject = IConditionObject> {
  protected _id: string = null;
  protected _condition: ConditionType<TConditionObject>;
  protected _errorCode: number = null;
  protected _conditionObject: TConditionObject = {} as TConditionObject;

  protected _reverse: FilterModel<TConditionObject> = null;
  protected _decoratorProperty: decorator.DecoratorPropertyType = null;
  protected _decoratorClass: decorator.DecoratorClassType = null;

  constructor(condition: ConditionType<TConditionObject>, errorCode?: number) {
    this._id = guid.guid();
    this._condition = condition;
    this._errorCode = errorCode;
    this.register();
  }

  public get reverse() {
    if (!this._reverse) {
      const condition = (conditionObject: TConditionObject) => {
        const resultPromising = this.condition(conditionObject);
        if (resultPromising instanceof Promise) return resultPromising.then(result => !result);
        return !resultPromising;
      };
      const errorCode = this.errorCode * -1;
      this._reverse = new FilterModel<TConditionObject>(condition, errorCode);
    }
    return this._reverse;
  }

  public get decoratorProperty() {
    if (!this._decoratorProperty) {
      this._decoratorProperty = decorator.createPropertyDecorator(this, this.conditionObject);
    }
    return this._decoratorProperty;
  }

  public get decoratorClass() {
    if (!this._decoratorClass) {
      this._decoratorClass = decorator.createClassDecorator(this, this.conditionObject);
    }
    return this._decoratorClass;
  }

  get id() {
    return this._id;
  }

  get conditionObject() {
    return this._conditionObject;
  }

  /**
   *  If code ```0``` it`s successful, other - custom errors. Defaults: ```0```
   */
  get errorCode() {
    return this._errorCode || 0;
  }

  get condition() {
    return (conditionObject: TConditionObject) => this._condition(conditionObject);
  }

  public clone<CConditionObject extends IConditionObject = TConditionObject>(
    newCondition?: ConditionType<CConditionObject>,
    newErrorCode?: number,
  ) {
    const fm = new FilterModel<CConditionObject>(
      newCondition || (this.condition as any),
      newErrorCode || this.errorCode,
    );
    fm._conditionObject = Object.assign(fm._conditionObject, this._conditionObject) as any;
    return fm;
  }

  public use(key: keyof TConditionObject, value: TConditionObject[keyof TConditionObject]) {
    const fm = this.clone();
    fm._conditionObject = Object.assign(fm._conditionObject, { [key]: value });
    return fm;
  }

  public register() {
    validator.register(this);
  }

  public unregister() {
    validator.unregister(this);
  }
}

export class ConditionModel extends FilterModel<any> {
  protected _general: FilterModel = null;
  protected _first: FilterModel[] = [];
  protected _second: FilterModel[] = [];

  constructor(general: FilterModel, first: FilterModel | FilterModel[], second: FilterModel | FilterModel[]) {
    super(null);
    this._general = general;
    this._first = Array.isArray(first) ? first : first ? [first] : [];
    this._second = Array.isArray(second) ? second : second ? [second] : [];
    this._condition = async ({ value, obj, key }) => {
      this._errorCode = 0;

      const resultGeneral = await general.condition({ value, obj, key });
      if (resultGeneral) {
        for (const model of this._first) {
          const result = await model.condition({ value, obj, key });
          if (!result) {
            this._errorCode = model.errorCode;
            return false;
          }
        }
        return true;
      }
      for (const model of this._second) {
        const result = await model.condition({ value, obj, key });
        if (!result) {
          this._errorCode = model.errorCode;
          return false;
        }
      }
      return true;
    };
  }

  get reverse() {
    if (!this._reverse) this._reverse = new ConditionModel(this._general.reverse, this._first, this._second);
    return this._reverse;
  }
}
