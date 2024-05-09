import { UIState } from './ui.interface';
import { createReducer, on } from '@ngrx/store';
import { CrossTabulationUIActions, VariableTabUIAction } from './ui.actions';

export const initialState: UIState = {
  bodyToggle: 'cross-tab',
  bodyState: {
    variables: {
      groupSelectedID: 'ALL',
      importComponentState: 'close',
      categoriesDeclaredMissing: {},
      variableSelectionContext: {
        'ALL': []
      },
      openVariable: {
        variableID: '',
        mode: 'view'
      }
    },
    crossTab: {
      missingCategories: {},
      selection: {}
    }
  }
};

export const uiReducer = createReducer(initialState,
  on(VariableTabUIAction.navigateToVariableTab, state => ({
    ...state,
    bodyToggle: 'variables' as const
  })),
  on(VariableTabUIAction.changeSelectedGroupID, (state, { groupID }) =>
    ({
      ...state,
      bodyState: {
        ...state.bodyState,
        variables: {
          ...state.bodyState.variables,
          groupSelectedID: groupID,
          importComponentState: 'close' as const
        }
      }
    })),
  on(VariableTabUIAction.changeOpenVariable,
    (state, { variableID, mode }) => (
      {
        ...state,
        bodyState: {
          ...state.bodyState,
          variables: {
            ...state.bodyState.variables,
            openVariable: {
              variableID: mode ? variableID : '',
              mode: mode ?? state.bodyState.variables.openVariable.mode
            }
          }
        }
      }
    )),
  on(VariableTabUIAction.changeVariableSelectionContext, (state, { variableIDs, selectedGroup }) =>
    ({
      ...state,
      bodyState: {
        ...state.bodyState,
        variables: {
          ...state.bodyState.variables,
          variableSelectionContext: {
            ...state.bodyState.variables.variableSelectionContext,
            [selectedGroup]: variableIDs
          }
        }
      }
    })),
  on(VariableTabUIAction.openVariableImportMenu, state => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        importComponentState: 'open' as const
      }
    }
  })),
  on(VariableTabUIAction.closeVariableImportMenu, state => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        importComponentState: 'close' as const
      }
    }
  })),
  on(VariableTabUIAction.changeMissingCategories, (state, { variableID, categories }) => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        categoriesDeclaredMissing: {
          ...state.bodyState.variables.categoriesDeclaredMissing,
          [variableID]: categories
        }
      }
    }
  })),
  on(CrossTabulationUIActions.navigateToCrossTabulationTab, state => ({
    ...state,
    bodyToggle: 'cross-tab' as const
  })),
  on(CrossTabulationUIActions.addToSelection, (state, { variableID, orientation }) =>
    ({
      ...state,
      bodyState: {
        ...state.bodyState,
        crossTab: {
          ...state.bodyState.crossTab,
          selection: {
            ...state.bodyState.crossTab.selection,
            // This makes sure we are adding to the last index of the current
            // selection
            [Object.keys(state.bodyState.crossTab.selection).length]: {
              variableID,
              orientation
            }
          }
        }
      }
    })
  )
  // TODO: properly implement
  // on(CrossTabulationUIActions.removeVariableUsingVariableID, (state, {variableID}) =>
  //   ({
  //     ...state
  //   })),
  // on(CrossTabulationUIActions.removeVariablesUsingIndex, (state, {index}) =>
  //   ({
  //     ...state
  //   })),
);