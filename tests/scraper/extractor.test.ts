import { extractValue } from '../../src/scraper/extractor';

const HTML = `
<html><body>
  <span class="price">€29.99</span>
  <div id="stock">En stock</div>
  <div class="empty">   </div>
</body></html>`;

describe('extractValue', () => {
  it('extracts text from a matching selector', () => {
    expect(extractValue(HTML, '.price')).toBe('€29.99');
  });

  it('returns null when selector does not match', () => {
    expect(extractValue(HTML, '.notexist')).toBeNull();
  });

  it('returns null for whitespace-only elements', () => {
    expect(extractValue(HTML, '.empty')).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    expect(extractValue('<p class="v">  hello  </p>', '.v')).toBe('hello');
  });

  it('targets the first match when multiple exist', () => {
    const html = '<span class="p">A</span><span class="p">B</span>';
    expect(extractValue(html, '.p')).toBe('A');
  });
});
