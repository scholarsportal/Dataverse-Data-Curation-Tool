declare var Buffer: any;
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { Observable } from 'rxjs';
import { merge } from 'lodash';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';
import { JSONStructure, Variable } from '../state/interface';
@Injectable({
  providedIn: 'root',
})
export class DdiService {
  private searchURL = `${environment.domain}/download`;
  private parseOptions: { ignoreAttributes: false; attributeNamePrefix: '@_' } =
    {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    };

  constructor(private http: HttpClient) {}

  parseXML(data: any) {
    const parser = new XMLParser(this.parseOptions);
    const parsed = parser.parse(data);
    return parsed;
  }

  createXML(
    groups: any,
    variables: any,
    fileid: string,
    siteURL: string = 'https://borealisdata.ca'
  ) {
    let groupsConfigurable = { ...groups };
    // Fetch data from URL (it is an XML)
    const fetchurl = `https://borealisdata.ca/api/access/datafile/${fileid}/metadata/ddi`;

    // Make an HTTP request to the fetch URL and parse the XML response
    return this.http.get(fetchurl, { responseType: 'text' }).pipe(
      map((data: string) => {
        const parsed = this.parseXML(data);
        const dataDscr = parsed.codeBook.dataDscr;
        dataDscr.var.forEach((data: any) => {
          data = merge(data, variables[data['@_ID']]);
        });
        // Change edited groups
        dataDscr.varGrp.forEach((varGrp: any) => {
          // TODO: Merge old and new groups
          varGrp['@_var'] = [...groupsConfigurable[varGrp['@_ID']]['@_var']];
          delete groupsConfigurable[varGrp['@_ID']];
        });
        // Add remaining groups
        Object.keys(groupsConfigurable).forEach((id: string) => {
          dataDscr.varGrp.push({
            '@_ID': id,
            labl: groupsConfigurable[id]['labl'],
            '@_var': [...groupsConfigurable[id]['@_var']],
          });
        });
        console.log(dataDscr.varGrp);
        return parsed;
      }),
      map((resultingXML: any) => {
        const builder = new XMLBuilder(this.parseOptions);
        return builder.build(resultingXML);
      })
    );
  }

  fetchDatasetFromDataverse(
    fileID: number,
    siteURL: string
  ): Observable<string> {
    return this.http.get(
      `${siteURL}/api/access/datafile/${fileID}/metadata/ddi`,
      { responseType: 'text' }
    );
  }

  XMLtoJSON(xml: string): JSONStructure {
    const parser = new XMLParser(this.parseOptions);
    const parsed = parser.parse(xml);
    return parsed;
  }
}