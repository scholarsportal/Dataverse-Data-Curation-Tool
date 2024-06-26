import { createAction, props } from '@ngrx/store';
import {
  JSONStructure,
  Variable,
  VariableForm,
  VariableFormTemplate,
  VariableGroup,
} from '../interface';

export const fetchDataset = createAction(
  '[Dataset] Fetch Dataset',
  props<{ fileID: number; siteURL: string; apiKey: string }>(),
);
export const fetchDatasetError = createAction(
  '[Dataset] Fetch Dataset Error',
  props<{ error: unknown }>(),
);
export const fetchDatasetSuccess = createAction(
  '[Dataset] Fetch Dataset Success',
  props<{ data: string; siteURL: string; fileID: number; apiKey?: string }>(),
);

export const datasetConversionPending = createAction(
  '[Dataset] Conversion Pending',
);
export const datasetConversionSuccess = createAction(
  '[Dataset] Conversion Success',
  props<{
    dataset: JSONStructure;
    siteURL: string;
    fileID: number;
    apiKey?: string;
  }>(),
);
export const datasetConversionError = createAction(
  '[Dataset] Conversion Error',
  props<{ error: string }>(),
);
export const setDataset = createAction(
  '[Dataset] Set Dataset',
  props<{ dataset: JSONStructure }>(),
);

export const saveVariable = createAction(
  '[Dataset] Variable Changesd',
  props<{
    variableID: string;
    variable: VariableForm;
    groups: string[];
  }>(),
);

export const saveBulkVariable = createAction(
  '[Dataset] Multiple Variable Changed',
  props<{ variableID: string[]; variable: VariableForm }>(),
);

export const datasetUploadRequest = createAction(
  '[Dataset Upload] Dataset Upload Requested',
  props<{
    dataset: JSONStructure;
    siteURL: string;
    fileID: number;
    apiKey?: string;
  }>(),
);

export const datasetUploadStart = createAction(
  '[Dataset Upload] Dataset Upload Started',
  props<{
    xml: string;
    siteURL: string;
    fileID: number;
    apiKey?: string;
  }>(),
);

export const datasetUploadSuccess = createAction(
  '[Dataset] Dataset Upload Success',
);

export const datasetUploadFailed = createAction(
  '[Dataset] Dataset Upload Failed',
  props<{ error: string }>(),
);

export const datasetImportMetadataStart = createAction(
  '[Dataset] Import New File Metadata',
  props<{ file: string; variableTemplate: VariableFormTemplate }>(),
);

export const metadataImportConversionSuccess = createAction(
  '[Metadata] Metadata Imported Successfully',
  props<{ dataset: JSONStructure; variableTemplate: VariableFormTemplate }>(),
);

export const metadataImportConversionFailed = createAction(
  '[Metadata] File error: could not convert to JSON',
  props<{ error: string }>(),
);
