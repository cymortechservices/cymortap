import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWhatsAppText } from '@/lib/waFormat';

const html = (t: string) => render(<p>{renderWhatsAppText(t)}</p>).container.innerHTML;

describe('renderWhatsAppText', () => {
  it('renders bold, italic, strike and mono', () => {
    const out = html('*Hi* _there_ ~old~ ```x```');
    expect(out).toContain('<strong');
    expect(out).toContain('<em>there</em>');
    expect(out).toContain('<s ');
    expect(out).toContain('<code');
  });
  it('never creates HTML from the message', () => {
    const out = html('<img src=x onerror=alert(1)> *b*');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });
  it('leaves in-word markers alone', () => {
    const out = html('snake_case_name and 2*3*4');
    expect(out).not.toContain('<em>');
    expect(out).not.toContain('<strong');
  });
});
