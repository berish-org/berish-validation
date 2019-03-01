import * as filterModel from '../filterModel';

describe('Проверка модели фильтров', () => {
  test('Создание кастомного фильтра', async done => {
    const IS_REQUIRED_CONDITION = async ({ value }) => !!value;
    const IS_REQUIRED_ERROR_CODE = 1;

    const isRequiredFilter = new filterModel.FilterModel(IS_REQUIRED_CONDITION, IS_REQUIRED_ERROR_CODE);
    expect(isRequiredFilter.errorCode).toBe(IS_REQUIRED_ERROR_CODE);

    const result1 = await isRequiredFilter.condition({ value: 'Ravil' });
    expect(result1).toBe(true);
    const result2 = await isRequiredFilter.condition({ value: '' });
    expect(result2).toBe(false);

    const reverse = isRequiredFilter.reverse;
    const reverseResult1 = await reverse.condition({ value: 'Ravil' });
    expect(reverseResult1).toBe(false);
    const reverseResult2 = await reverse.condition({ value: '' });
    expect(reverseResult2).toBe(true);

    done();
  });
});
