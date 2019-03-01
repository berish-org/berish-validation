import { validator } from '..';
import * as decorator from '../decorator';
import { ConditionModel, FilterModel } from '../filterModel';

const isNotEmptyFunc = async value => !!value;
const isNotEmptyErrorCode = 1;

const isNotEmptyFilter = new FilterModel(isNotEmptyFunc, isNotEmptyErrorCode);
const isNotEmptyWhenTyped = (type: string) => (type === 'video' ? isNotEmptyFilter.decoratorProperty : null);

describe('Проверка декораторов', () => {
  test('Навешивание декоратора и проверка 1 уровня', async done => {
    // class User {
    //   private _name: string = null;
    //   @isNotEmptyWhenTyped('video')
    //   get name() {
    //     return this._name;
    //   }
    //   set name(value: string) {
    //     this._name = value;
    //   }
    // }
    // const validator = new Validator([isNotEmptyFilter]);
    // const admin = new User();
    // admin.name = '';
    // const results = await validator.validateLocal(admin);
    // expect(
    //   results
    //     .values()
    //     .selectMany(m => m)
    //     .toArray(),
    // ).toEqual([isNotEmptyErrorCode]);
    done();
  });

  test('Проверка фильтров на классах', async done => {
    const getCurrentUsername = () => {
      return Promise.resolve('berishev');
    };

    const forUser = async ({ value, key, obj, username }) => {
      // console.log(username);
      const current = await getCurrentUsername();
      return current === username;
    };

    const forUserCode = 1;
    const forUserFilter = new FilterModel(forUser, forUserCode);
    // console.log(forUserFilter.conditionObject);

    // @(forUserFilter.use('username', 'admin').decoratorClass)
    class Controller {}
    // console.log(forUserFilter.use('username', 'admin').decoratorClass(Controller));

    const results = await validator.validateClass(Controller);
    // console.log(results);

    done();
  });

  test('azatick', async done => {
    const getCurrentUser = () => {
      return Promise.resolve({ username: 'berishev' });
    };

    const forUser = async ({ value, obj, key, username }) => {
      const current = await getCurrentUser();
      return current && current.username === username;
    };

    const forUserError = 3;
    const forUserFilter = new FilterModel(forUser, forUserError);
    const byWho = username => forUserFilter.use('username', username);

    @(byWho('berishev').decoratorClass)
    class Controller {}

    class Profile {
      @decorator.Property(byWho('azatick').decoratorProperty)
      private firstname: string = null;
    }

    const result1 = await validator.validateClass(Controller);
    const result2 = await validator.validateLocal(new Profile());

    done();
  });
});
