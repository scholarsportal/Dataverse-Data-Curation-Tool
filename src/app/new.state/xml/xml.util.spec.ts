/// <reference types="jasmine" />

import { changeWeightForSelectedVariables } from './xml.util';
import { Category, SummaryStatistic, Variable } from './xml.interface';

function makeVariable(
  id: string,
  name: string,
  categories: { value: string; freq: number }[],
  overrides: Partial<Variable> = {},
): Variable {
  const catgry: Category[] = categories.map(({ value, freq }) => ({
    catValu: value,
    labl: { '#text': `label ${value}`, '@_level': 'category' },
    catStat: { '#text': freq, '@_type': 'freq' },
  }));
  return {
    location: { '@_fileid': 'f1' },
    labl: { '#text': `${name} label`, '@_level': 'variable' },
    qstn: { qstnLit: '' },
    universe: '',
    sumStat: [],
    catgry,
    varFormat: { '@_type': 'numeric' },
    notes: {
      '#text': 'system note',
      '@_subject': '',
      '@_level': '',
      '@_type': '',
    },
    '@_ID': id,
    '@_name': name,
    '@_intrvl': 'discrete',
    '@_wgt-var': '',
    ...overrides,
  };
}

function statsOf(category: Category): SummaryStatistic[] {
  return Array.isArray(category.catStat) ? category.catStat : [category.catStat];
}

describe('changeWeightForSelectedVariables', () => {
  it('computes weighted frequencies for zero-padded category codes', () => {
    const allVariables = {
      v1: makeVariable('v1', 'REGION6', [
        { value: '01', freq: 2 },
        { value: '02', freq: 1 },
        { value: '96', freq: 0 },
      ]),
      vw: makeVariable('vw', 'WEIGHT', []),
    };
    const crossTab = {
      v1: ['01', '01', '02'],
      vw: ['2', '3', '4'],
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      'vw',
      crossTab,
    );
    const updated = result.find((variable) => variable['@_ID'] === 'v1');
    expect(updated).toBeDefined();
    const categories = updated!.catgry;
    const weightedOf = (value: string) => {
      const category = categories.find((cat) => cat.catValu === value);
      expect(category).toBeDefined();
      return statsOf(category!).find((stat) => stat['@_wgtd']);
    };
    expect(weightedOf('01')?.['#text']).toBe(5);
    expect(weightedOf('02')?.['#text']).toBe(4);
    // Category absent from the data has a genuine weighted frequency of zero.
    expect(weightedOf('96')?.['#text']).toBe(0);
    expect(weightedOf('01')?.['@_wgt-var']).toBe('vw');
  });

  it('leaves a variable unweighted when no category code matches the data', () => {
    const allVariables = {
      v1: makeVariable('v1', 'BROKEN', [
        { value: '01', freq: 2 },
        { value: '02', freq: 1 },
      ]),
      vw: makeVariable('vw', 'WEIGHT', []),
    };
    const crossTab = {
      v1: ['x', 'y', 'z'],
      vw: ['2', '3', '4'],
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      'vw',
      crossTab,
    );
    const updated = result.find((variable) => variable['@_ID'] === 'v1');
    expect(updated).toBeDefined();
    updated!.catgry.forEach((category) => {
      expect(Array.isArray(category.catStat)).toBe(false);
      expect(statsOf(category).some((stat) => stat['@_wgtd'])).toBe(false);
    });
  });

  it('removes weighted stats when weightID is "remove"', () => {
    const weighted = makeVariable('v1', 'REGION6', [{ value: '01', freq: 2 }]);
    weighted.catgry[0].catStat = [
      { '#text': 2, '@_type': 'freq' },
      { '#text': 5, '@_type': 'freq', '@_wgtd': 'wgtd', '@_wgt-var': 'vw' },
    ];
    const result = changeWeightForSelectedVariables(
      { v1: weighted },
      ['v1'],
      'remove',
      {},
    );
    const category = result[0].catgry[0];
    expect(Array.isArray(category.catStat)).toBe(false);
    const [stat] = statsOf(category);
    expect(stat['@_wgtd']).toBeUndefined();
    expect(stat['@_wgt-var']).toBeUndefined();
    expect(stat['#text']).toBe(2);
  });

  it('writes no weighted stats when no weight is being applied (metadata-only saves)', () => {
    // The single-variable save path calls this with assignedWeight = ''.
    // It must never fabricate zero-frequency weighted stats with an empty
    // wgt-var reference.
    const allVariables = {
      v1: makeVariable('v1', 'REGION6', [
        { value: '01', freq: 2 },
        { value: '02', freq: 1 },
      ]),
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      '',
      { v1: ['01', '01', '02'] },
    );
    result[0].catgry.forEach((category) => {
      expect(Array.isArray(category.catStat)).toBe(false);
      expect(statsOf(category).some((stat) => stat['@_wgtd'])).toBe(false);
    });
  });

  it('skips non-numeric weight cells instead of producing NaN', () => {
    const allVariables = {
      v1: makeVariable('v1', 'VAR', [{ value: '01', freq: 3 }]),
      vw: makeVariable('vw', 'WEIGHT', []),
    };
    const crossTab = {
      v1: ['01', '01', '01'],
      vw: ['2', 'NA', '3'],
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      'vw',
      crossTab,
    );
    const updated = result.find((v) => v['@_ID'] === 'v1');
    expect(updated).toBeDefined();
    const weighted = statsOf(updated!.catgry[0]).find((stat) => stat['@_wgtd']);
    expect(weighted?.['#text']).toBe(5);
  });
});
