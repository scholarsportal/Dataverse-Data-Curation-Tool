import { ddiJSONStructure } from '../../old.state/interface';
import { createReducer, on } from '@ngrx/store';
import { DataverseFetchActions } from '../xml/xml.actions';
import { DatasetActions } from './dataset.actions';

export interface DatasetState {
  operationStatus: {
    download: 'idle' | 'pending' | 'error' | 'success';
    upload: 'idle' | 'pending' | 'error' | 'success' | 'disabled';
    import: 'idle' | 'pending' | 'error' | 'success';
  };
  variables: {
    importedDataset: ddiJSONStructure | null;
    importedResult: string | null;
  };
  crossTabulation: {
    [variableID: string]: string[];
  };
}

const initialState: DatasetState = {
  operationStatus: {
    download: 'idle',
    upload: 'idle',
    import: 'idle',
  },
  variables: {
    importedDataset: null,
    importedResult: null,
  },
  crossTabulation: {},
};

export const datasetReducer = createReducer(
  initialState,
  on(DataverseFetchActions.startDDIFetch, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'pending' as const,
      },
    };
  }),
  on(DataverseFetchActions.fetchDDIError, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'error' as const,
      },
    };
  }),
  on(DataverseFetchActions.fetchDDISuccess, (state) => ({
    ...state,
    operationStatus: {
      ...state.operationStatus,
      download: 'success' as const,
    },
  })),
  on(DatasetActions.updateCrossTabValues, (state, { data, variableID }) => {
    return {
      ...state,
      crossTabulation: {
        ...state.crossTabulation,
        [variableID]: data,
      },
    };
  }),
);
