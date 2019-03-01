import * as schema from '../schema';

describe('проверка просто модели валидирования', () => {
  test('Проверка любого объекта', () => {
    const SYMBOL_TEST_RULE = Symbol('test');
    const model = schema.prepare({}, 'name');

    expect(model).toEqual({ name: [] });

    schema.addFilter(model, 'name', SYMBOL_TEST_RULE);
    expect(model.name).toEqual([{ id: SYMBOL_TEST_RULE, args: {} }]);
    expect(schema.hasFilter(model, 'name', SYMBOL_TEST_RULE)).toBe(true);

    const dict1 = schema.findLocalFilters(model);
    expect(dict1.keys().toArray()).toEqual(['name']);
    expect(
      dict1
        .values()
        .selectMany(m => m)
        .select(m => m.id)
        .toArray(),
    ).toEqual([SYMBOL_TEST_RULE]);

    const dict2 = schema.findLocalFilters(model, 'name');
    expect(dict2.containsKey('name')).toBe(true);
    expect(dict2.get('name')).toEqual([{ id: SYMBOL_TEST_RULE, args: {} }]);
  });
});
