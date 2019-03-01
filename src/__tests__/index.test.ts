import { Property } from '../decorator';
import { FilterModel, modelSchema, schema, validator } from '../index';
const isNotEmptyFunc = async ({ value }) => !!value;
const isNotEmptyErrorCode = 1;

const isNotEmptyFilter = new FilterModel(isNotEmptyFunc, isNotEmptyErrorCode);

describe('проверка функционала общей библиотеки', () => {
  test('Проверка многовложенности', async done => {
    class User {
      @Property(isNotEmptyFilter.decoratorProperty)
      public profile: Profile = null;
    }

    class Profile {
      @Property(isNotEmptyFilter.decoratorProperty)
      public name: string = null;

      @Property(isNotEmptyFilter.decoratorProperty)
      public lastname: string = null;
    }

    const profile = new Profile();
    profile.name = 'Ravil';

    const user = new User();
    user.profile = profile;

    const profileRes = await validator.validateLocal(profile);
    const userRes = await validator.validateLocal(user);

    done();
  });
});
