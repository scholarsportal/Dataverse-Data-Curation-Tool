import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from '../interface';
import { selectVariableWeights, selectVariables } from '../selectors';

const selectFeature = createFeatureSelector<State>('globalState');

export const selectOpenModal = createSelector(
  selectFeature,
  (state) => state.modal
);

export const selectOpenModalVariable = createSelector(
  selectOpenModal,
  (modal) => {
    return modal?.variable;
  }
);

export const selectOpenModalVariableAsForm = createSelector(
  selectOpenModalVariable,
  (variable) => {
    if(variable){
      return {
        id: variable['@_ID'],
        name: variable['@_name'],
        label: variable.labl['#text'],
        literalQuestion: variable.qstn?.qstnLit,
        interviewerQuestion: variable.qstn?.ivuInstr,
        postQuestion: variable.qstn?.postQTxt,
        universe: variable.universe,
        notes: variable.notes,
        group: variable.groups,
        isWeight: variable['@_wgt'] ? true : false,
      };
    } else {
      return {
          id: '',
          name: '',
          label: '',
          literalQuestion: '',
          interviewerQuestion: '',
          postQuestion: '',
          universe: '',
          notes: '',
          group: '',
          isWeight: false,
      };
    }
  }
);

export const selectCheckModalLabel = createSelector(
  selectOpenModalVariable,
  (variable) => {
    return variable?.labl['#text'];
  }
);

export const selectCheckModalID = createSelector(
  selectOpenModalVariable,
  (variable) => {
    return variable ? variable['@_ID'] : null;
  }
);

export const selectCheckModalName = createSelector(
  selectOpenModalVariable,
  (variable) => {
    return variable ? variable['@_name'] : null;
  }
);

export const selectOpenModalVariableWeight = createSelector(
  selectOpenModal,
  selectVariables,
  (modal, variables) => {
    return ( modal.variable && modal.variable['@_wgt-var'] )
      ? variables[modal.variable['@_wgt-var']]
      : '';
  }
);

export const selectOpenVariableGroups = createSelector(
  selectOpenModal,
  (modal) => {
    return modal.groups;
  }
);

export const selectCheckModalOpen = createSelector(selectOpenModal, (modal) => {
  return modal.open;
});

export const selectCheckModalMode = createSelector(selectOpenModal, (modal) => {
  return modal.mode;
});

// Check if modal is saved
export const selectCheckModalState = createSelector(
  selectOpenModal,
  (modal) => {
    return modal.state;
  }
);

export const selectOpenModalDetail = createSelector(
  selectOpenModalVariable,
  selectOpenVariableGroups,
  selectVariableWeights,
  selectVariables,
  (openVariable, groups, varWeights, variables) => {
    let data: any = {};
    let total: number = 0;
    let sumStats: any = [];
    let weightedVariable: any = openVariable['@_wgt-var']
      ? variables[openVariable['@_wgt-var']]
      : '';
    if (openVariable && groups && varWeights) {
      sumStats = openVariable['sumStat'];

      if (openVariable['catgry']) {
        openVariable['catgry'].forEach((item: any) => {
          total += item.catStat[0]['#text'] ? item.catStat[0]['#text'] : 0;
          data = {
            ...data,
            [item.catValu]: {
              category: item.labl['#text'],
              count: item.catStat[0]['#text'],
              weightedCount: item.catStat[1]['#text'],
            },
          };
        });
      }

      const variable: any = {
        id: openVariable['@_ID'],
        name: openVariable['@_name'],
        label: openVariable.labl['#text'],
        literalQuestion: openVariable.qstn?.qstnLit,
        interviewerQuestion: openVariable.qstn?.ivuInstr,
        postQuestion: openVariable.qstn?.postQTxt,
        universe: openVariable.universe,
        notes: openVariable.notes,
        group: openVariable.groups,
        isWeight: openVariable['@_wgt'] ? true : false,
      };
      return {
        variable,
        groups,
        allVariableWeights: varWeights,
        weightedVariable,
        data,
        total,
        sumStats,
      };
    }
    if (openVariable === 'bulk' && varWeights) {
      return {
        variable: {
          id: '',
          name: '',
          label: '',
          literalQuestion: '',
          interviewerQuestion: '',
          postQuestion: '',
          universe: '',
          notes: '',
          group: '',
          isWeight: false,
        },
        groups: {},
      };
    }
    return { variable: {}, groups: {}, data, sumStats };
  }
);
