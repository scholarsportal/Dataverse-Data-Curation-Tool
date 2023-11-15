import { createReducer, on } from '@ngrx/store';
import * as Actions from './actions';

interface Citation {
  titlStmt: {
    titl: string;
    IDNo: string;
  };
  rspStmt: {
    AuthEnty: string;
  };
  biblCit: string;
}

interface CatStat {
  '#text': number | string;
  '@_type': string;
  '@_wgtd'?: string;
}

type Catgry = CatStat[];

export interface VarGroups {
  [id: string]: {
    '@_ID': string;
    'labl': string;
    '@_var': string[];
  }
}

export interface Variables {
  [id: string]: {
    '@_ID': string;
    '@_name': string;
    '@_intrvl': string;
    labl: {
      '#text': string;
      '@_level': string;
    };
    location: {
      '@_fileid': string;
    };
    notes: (string | {
      '#text': string;
      '@_subject': string;
      '@_level': string;
      '@_type': string;
    })[];
    qstn: {
      qstnLit: string;
      ivuInstr: string;
      postQTxt: string;
    },
    sumStat: {
      '#text': number | string;
      '@_type': string;
    }[];
    varFormat: {
      '@_type': string;
    };
    universe: string;
    groups: {
      [id: string]: {
        label: string
      }
    },
    catgry?: Catgry;
    '@_wgt-var'?: string;
    '@_wgt'?: 'wgt';
  };
}


export interface GraphObject {
  [id: string]: {
    weighted: { label: string; frequency: number }[];
    unweighted: { label: string; frequency: number }[];
  };
}

export interface State {
  dataset: {
    status: string;
    error: any;
    citation: Citation;
    variables: Variables;
    groups: VarGroups;
    varWeights: any;
  };
  changeGroup: string;
  openModal: {
    open: boolean;
    modalMode: 'editing' | 'chart' | 'settings' | '';
  };
  openVariable: {
    editing: boolean;
    variable: any;
    graph: any;
    previouslyOpen: GraphObject;
  };
  upload: {
    status: string;
    error: any;
  };
  variables: any[];
}

const initialState: State = {
  dataset: {
    status: '',
    error: null,
    citation: {
      titlStmt: {
        titl: "",
        IDNo: "",
      },
      rspStmt: {
        AuthEnty: "",
      },
      biblCit: "",
    },
    variables: {},
    groups: {},
    varWeights: {},
  },
  changeGroup: '',
  openModal: {
    open: false,
    modalMode: '',
  },
  openVariable: {
    editing: false,
    variable: null,
    graph: null,
    previouslyOpen: {},
  },
  upload: {
    status: '',
    error: null,
  },
  variables: [],
};

export const reducer = createReducer(
  initialState,
  // When the page first loads
  on(Actions.fetchDataset, (state) => ({
    ...state,
    dataset: { ...state.dataset, status: 'init' },
  })),
  on(Actions.datasetLoadPending, (state) => ({
    ...state,
    dataset: { ...state.dataset, status: 'pending' },
  })),
  on(Actions.datasetLoadSuccess, (state, { variables, groups, citation, varWeights }) => ({
    ...state,
    dataset: { ...state.dataset, status: 'success', variables, groups, citation, varWeights, error: null },
  })),
  on(Actions.datasetLoadError, (state, { error }) => ({
    ...state,
    dataset: { ...state.dataset, status: 'error', data: null, error },
  })),

  // When the user clicks the chart button
  on(Actions.variableViewChart, (state, { variable }) => ({
    ...state,
    openModal: { open: true, modalMode: 'chart' as const},
    openVariable: { ...state.openVariable, editing: false, variable: variable },
  })),

  on(Actions.variableCreateGraphSuccess,
    (state, { id, weighted, unweighted }) => ({
      ...state,
      openVariable: {
        ...state.openVariable,
        graph: { weighted, unweighted },
        previouslyOpen: {
          ...state.openVariable.previouslyOpen,
          [id]: { weighted, unweighted },
        },
      },
    })
  ),
  on(Actions.variableCreateGraphError, (state) => ({
    ...state,
    openVariable: {
      ...state.openVariable,
      graph: null,
    },
  })),

  // When the user clicks the edit button
  on(Actions.variableViewDetail, (state, { variable }) => ({
    ...state,
    openVariable: { ...state.openVariable, editing: true, variable: variable },
  })),

  // When the user clicks a group
  on(Actions.groupSelected, (state, { groupID }) => ({
    ...state,
    changeGroup: groupID,
  }))

  // on(Actions.datasetUploadRequest, (state) => ({ ...state, upload: { status: 'pending', error: null } })),
  // on(Actions.datasetUploadPending, (state) => ({ ...state, upload: { status: 'pending', error: null } })),
  // on(Actions.datasetUploadSuccess, (state) => ({ ...state, upload: { status: 'success', error: null } })),
  // on(Actions.datasetUploadError, (state, { error }) => ({ ...state, upload: { status: 'error', error } })),
  // on(Actions.datasetDownload, (state) => state), // No state change needed for download
  // on(Actions.datasetLocalSave, (state) => state), // No state change needed for local save
  // on(Actions.variableChangeDetail, (state, { variable }) => ({ ...state, variables: [...state.variables], upload: { status: '', error: null } })),
  // on(Actions.variableAddToSelectedGroup, (state, { variable }) => ({ ...state, variables: [...state.variables], upload: { status: '', error: null } })),
  //   on(Actions.groupCreateNew, (state) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } }))),
  // on(Actions.groupRemove, (state, { groupId }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } })),
  // on(Actions.groupChangeName, (state, { groupId, newName }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } })),
  // on(Actions.groupAddSelectedGroup, (state, { groupId }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } }),
);

export function appReducer(state: State | undefined, action: any) {
  return reducer(state, action);
}
