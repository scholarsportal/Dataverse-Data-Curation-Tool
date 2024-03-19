import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  datasetConversionError,
  datasetConversionSuccess,
  datasetImportMetadataStart,
  datasetUploadFailed,
  datasetUploadRequest,
  datasetUploadStart,
  datasetUploadSuccess,
  fetchDataset,
  fetchDatasetError,
  fetchDatasetSuccess,
  metadataImportConversionFailed,
  metadataImportConversionSuccess,
} from 'src/app/state/actions/dataset.actions';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { DdiService } from 'src/app/services/ddi.service';
import {
  getVariablesCrossTabulation,
  variableCrossTabulationDataRetrievalFailed,
  variableCrossTabulationDataRetrievedSuccessfully,
} from './actions/cross-tabulation.actions';

@Injectable()
export class AppEffects {
  fetchDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(fetchDataset),
        exhaustMap(({ fileID, siteURL, apiKey }) =>
          ddiService.fetchDatasetFromDataverse(fileID, siteURL).pipe(
            map((data) =>
              fetchDatasetSuccess({ data, fileID, siteURL, apiKey }),
            ),
            catchError((error) => of(fetchDatasetError(error))),
          ),
        ),
      );
    },
    { functional: true },
  );

  convertDataset$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(fetchDatasetSuccess),
        map(({ data, siteURL, fileID, apiKey }) => {
          const parsedXML = ddiService.XMLtoJSON(data);
          return datasetConversionSuccess({
            dataset: parsedXML,
            siteURL,
            fileID,
            apiKey,
          });
        }),
        catchError((error) => of(datasetConversionError({ error }))),
      );
    },
    { functional: true },
  );

  addInitialCrossTabRow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(datasetConversionSuccess),
      map(({ dataset, fileID, siteURL }) => {
        const variableID: string = dataset.codeBook.dataDscr.var[0]['@_ID'];
        return getVariablesCrossTabulation({
          fileID,
          siteURL,
          variableID,
          crossTableOrientation: 'rows',
          index: 0,
        });
      }),
    );
  });

  importNewMetadata$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(datasetImportMetadataStart),
        map(({ file, variableTemplate }) => {
          const parsedXML = ddiService.XMLtoJSON(file);
          return metadataImportConversionSuccess({
            dataset: parsedXML,
            variableTemplate,
          });
        }),
        catchError((error) => of(metadataImportConversionFailed({ error }))),
      );
    },
  );

  requestDatasetUpload$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(datasetUploadRequest),
        map(({ dataset, fileID, siteURL, apiKey }) => {
          const parsedJSON = ddiService.JSONtoXML(dataset);
          return datasetUploadStart({
            xml: parsedJSON,
            fileID,
            siteURL,
            apiKey,
          });
        }),
        catchError((error) => of(datasetUploadFailed({ error }))),
      );
    },
  );

  completeDatasetUpload$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(datasetUploadStart),
        exhaustMap(({ xml, siteURL, fileID, apiKey }) =>
          ddiService
            .uploadDatasetToDataverse(siteURL, fileID, xml, apiKey)
            .pipe(
              map((data) => {
                if (data?.error) {
                  return datasetUploadFailed({ error: data.error });
                }
                return datasetUploadSuccess();
              }),
              catchError((error) => of(datasetUploadFailed({ error }))),
            ),
        ),
      );
    },
  );

  fetchCrossTabulationValues$ = createEffect(
    (ddiService: DdiService = inject(DdiService)) => {
      return this.actions$.pipe(
        ofType(getVariablesCrossTabulation),
        exhaustMap(
          ({ fileID, siteURL, variableID, index, crossTableOrientation }) =>
            ddiService
              .fetchCrossTabulationFromDataverse(siteURL, fileID, variableID)
              .pipe(
                map((data) =>
                  variableCrossTabulationDataRetrievedSuccessfully({
                    data,
                    index,
                    crossTableOrientation,
                    variableID,
                  }),
                ),
                catchError((error) =>
                  of(variableCrossTabulationDataRetrievalFailed(error)),
                ),
              ),
        ),
      );
    },
  );

  constructor(private actions$: Actions) {}
}
