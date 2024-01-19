interface Location {
  '@_fileid': string;
}

interface Label {
  '#text': string;
  '@_level': string;
}

interface Question {
  qstnLit: string;
}

interface SummaryStatistic {
  '#text': string | number;
  '@_type': string;
  '@_wgtd'?: string; // Optional property
}

interface Category {
  catValu: number;
  labl: Label;
  catStat: SummaryStatistic[];
}

interface Variable {
  location: Location;
  labl: Label;
  qstn: Question;
  universe: string;
  sumStat: SummaryStatistic[];
  catgry: Category[];
  varFormat: {
    '@_type': string;
  };
  notes: {
    '#text': string;
    '@_subject': string;
    '@_level': string;
    '@_type': string;
  };
  '@_ID': string;
  '@_name': string;
  '@_intrvl': string;
  '@_wgt-var': string;
}

interface VariableGroup {
  labl: string;
  '@_ID': string;
  '@_var': string;
}

interface StudyDescription {
  citation: {
    titlStmt: {
      titl: string;
      IDNo: {
        '#text': string;
        '@_agency': string;
      };
    };
    rspStmt: {
      AuthEnty: string;
    };
    biblCit: string;
  };
}

interface FileDescription {
  fileTxt: {
    fileName: string;
    dimensns: {
      caseQnty: number;
      varQnty: number;
    };
    fileType: string;
  };
  notes: {
    '#text': string;
    '@_level': string;
    '@_type': string;
    '@_subject': string;
  };
  '@_ID': string;
}

interface DataDescription {
  varGrp: VariableGroup[];
  var: Variable[];
}

interface CodeBook {
  stdyDscr: StudyDescription;
  fileDscr: FileDescription;
  dataDscr: DataDescription;
  '@_xmlns': string;
  '@_version': string;
}

interface XML {
  '?xml': {
    '@_version': string;
    '@_encoding': string;
  };
}

export interface JSONStructure {
  '?xml': XML['?xml'];
  codeBook: CodeBook;
}