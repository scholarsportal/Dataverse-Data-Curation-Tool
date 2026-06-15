import { TestBed } from '@angular/core/testing';

import { DdiService } from './ddi.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStore } from '@ngrx/store';

describe('DdiService', () => {
  let service: DdiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // provideHttpClient must come before provideHttpClientTesting so
      // requests hit the test backend instead of the real network.
      providers: [
        provideStore(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DdiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('XML round-trip fidelity (issue #179)', () => {
    // Dataverse matches catValu against its database by exact string
    // equality, so zero-padded ("01") and decimal ("1.0") codes must
    // survive parse + serialize unchanged.
    const fixture =
      '<codeBook><dataDscr>' +
      '<var ID="v1" name="REGION6">' +
      '<catgry><catValu>01</catValu><labl level="category">Atlantic</labl>' +
      '<catStat type="freq">150</catStat></catgry>' +
      '<catgry><catValu>96</catValu><labl level="category">Valid skip</labl>' +
      '<catStat type="freq">10</catStat></catgry>' +
      '</var>' +
      '<var ID="v2" name="HRLYEARN">' +
      '<catgry><catValu>9999.97</catValu><labl level="category">DK</labl></catgry>' +
      '<catgry><catValu>1.0</catValu><labl level="category">One</labl></catgry>' +
      '<catgry><catValu>00</catValu><labl level="category">Zero</labl></catgry>' +
      '</var>' +
      '</dataDscr></codeBook>';

    it('parses catValu as a string, preserving leading zeros', () => {
      const parsed = service.XMLtoJSON(fixture);
      const categories = parsed.codeBook.dataDscr.var[0].catgry;
      expect(categories[0].catValu).toBe('01');
      expect(categories[1].catValu).toBe('96');
    });

    it('preserves zero-padded and decimal catValu values through a full round trip', () => {
      const rebuilt = service.JSONtoXML(service.XMLtoJSON(fixture));
      expect(rebuilt).toContain('<catValu>01</catValu>');
      expect(rebuilt).toContain('<catValu>96</catValu>');
      expect(rebuilt).toContain('<catValu>9999.97</catValu>');
      expect(rebuilt).toContain('<catValu>1.0</catValu>');
      expect(rebuilt).toContain('<catValu>00</catValu>');
    });

    it('preserves frequency text values verbatim', () => {
      const rebuilt = service.JSONtoXML(service.XMLtoJSON(fixture));
      expect(rebuilt).toContain('<catStat type="freq">150</catStat>');
      expect(rebuilt).toContain('<catStat type="freq">10</catStat>');
    });
  });

  describe('splitLines tab-value sanitization (issue #197)', () => {
    it('strips surrounding quotes from character values', () => {
      const input = 'CASEID\tPROV\n"000010"\t"01"\n"000011"\t"13"\n';
      const result = service.splitLines(['v0', 'v1'], input);
      expect(result['v0']).toEqual(['000010', '000011']);
      expect(result['v1']).toEqual(['01', '13']);
    });

    it('handles CRLF line endings without leaving \\r on the last column', () => {
      const input = 'CASEID\tPROV\r\n"000010"\t"01"\r\n"000011"\t"13"\r\n';
      const result = service.splitLines(['v0', 'v1'], input);
      expect(result['v1']).toEqual(['01', '13']);
    });

    it('passes unquoted numeric values through unchanged', () => {
      const input = 'WEIGHTD\tHHTOTINC\n396.9489\t24733\n12.5\t0\n';
      const result = service.splitLines(['v0', 'v1'], input);
      expect(result['v0']).toEqual(['396.9489', '12.5']);
      expect(result['v1']).toEqual(['24733', '0']);
    });

    it('unescapes embedded quotes inside quoted values', () => {
      const input = 'NAME\n"a\\"b"\n';
      const result = service.splitLines(['v0'], input);
      expect(result['v0']).toEqual(['a"b']);
    });

    it('still throws when the column count does not match', () => {
      const input = 'A\tB\n1\t2\n';
      expect(() => service.splitLines(['v0'], input)).toThrowError(
        'The number of keys does not match the number of columns.',
      );
    });
  });
});
