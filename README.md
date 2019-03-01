# berish-validation&middot; [![Apache license](https://img.shields.io/badge/license-Apache-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE) ![Coverage Status](https://img.shields.io/coveralls/facebook/react/master.svg?style=flat)

Сложная динамическая валидация любых типов объектов (поддержка классов и полей). Полная поддержка `typescript`.

### Установка

`yarn add berish-validation`
или
`npm install berish-validation --save`

# API

## FilterModel

Первичная форма создания фильтра для валидации

```typescript
import * as validation from 'berish-validation';

new validation.FilterModel(
	condition: validation.ConditionType<validation.IConditionObject>,
	errorCode?: number): validation.FilterModel<validation.IConditionObject>
```

Пример создания для фильтра валидации `isRequired`

```typescript
const isRequiredFunc = async ({ value, obj, key, ...args }) => !!value;
const isRequiredCode = 1;
const isRequiredFilter = new FilterModel(isRequiredFunc, isRequiredCode);

// isRequiredFilter.condition !== isRequiredFilter.condition (ре-генерация условия каждый раз)
```

Возможное взаимодействие

- `clone` - Клонирование фильтра, для последующего использования

```typescript
(method) FilterModel<T>.clone<CConditionObject>(
	newCondition?:  ConditionType<CConditionObject>,
	newErrorCode?:  number): FilterModel<CConditionObject>

const clone = isRequiredFilter.clone();
// clone.id !== isRequiredFilter.id;
```

- `reverse` - Полностью противоположный фильтр по проходящему условию

```typescript
(property) FilterModel<T>.reverse: FilterModel<T>

const reverse1 = isRequiredFilter.reverse;
const reverse2 = isRequiredFilter.reverse;
// reverse1 === reverse2;
// reverse1 !== isRequiredFilter.reverse.reverse;
// reverse1.id !== isRequiredFilter.id

const result1 = await isRequiredFilter.condition({value: '123'});
console.log(result1); //true
const result2 = await isRequiredFilter.reverse.condition({value: '123'});
console.log(result2); // false
```

- `register` и `unregister` - методы принудительной регистрации фильтра в контроллере валидатора (по-умолчанию при инициализации происходит `register()`)

```typescript
isRequiredFilter.register();
isRequiredFilter.unregister();
```

- `id` - уникальный идентификатор каждого фильтра, Благодаря id контроллер валидатора понимает, какой конкретно фильтр нужно проверить для нужного объекта или поля объекта
- `conditionObject` - Специальный объект, через который передаются все аргументы внутрь фильтра через применение данного фильтра при фактическом выполнении

```typescript
console.log(isRequiredFilter.conditionObject); // {}
console.log(isRequiredFilter.use('username', 'admin').conditionObject); // { username: 'admin' }
```

- `use` - Заполняет, описанный выше объект. Метод нужно вызывать, когда Вы хотите передавать аргументы внутрь фильтра. Аргументы передаются внутрь условия `condition`

```typescript
const accessForUserErrorCode = 2;
const accessForUser = async ({ value, obj, key, username }) => {
  const currentUser = await getCurrentUser();
  return username === currentUser.name;
};

const accessForUserFilter = new FilterModel(accessForUser, accessForUserErrorCode);

// Пример 1

@(accessForUserFilter.use('username', 'admin').decoratorClass)
class Controller {}

// Пример 2

const accessForUserClass = (username: string) => accessForUserFilter.use('username', username).decoratorClass;

@accessForUserClass('admin')
class Controller {}

// Пример 3

const accessForUserProperty = username => accessForUserFilter.use('username', username).decoratorProperty;

class Profile {
  @accessForUserProperty('admin')
  get firstname() {
    return this._firstname;
  }
}
```
