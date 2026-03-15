/**
 * @jest-environment jsdom
 */
import { renderDashboard } from '../public/js/ui.js';

// Polyfill TextEncoder for jsdom
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock getContext for Chart.js
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillText: jest.fn(),
  measureText: jest.fn().mockReturnValue({ width: 0 }),
  canvas: { width: 0, height: 0 }
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock global Chart
global.Chart = jest.fn().mockImplementation(() => ({
  destroy: jest.fn()
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('UI Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="resultContainer"></div>
      <div id="status"></div>
    `;
    jest.clearAllMocks();
  });

  test('renderDashboard populates resultContainer', () => {
    const mockData = {
      name: 'Test Torrent',
      infoHash: 'abc',
      magnetUri: 'magnet:?xt=urn:btih:abc',
      size: '10 MB',
      numFiles: 5,
      isMagnet: false,
      files: []
    };

    renderDashboard(mockData);

    const container = document.getElementById('resultContainer');
    expect(container.innerHTML).toContain('Test Torrent');
    expect(container.innerHTML).toContain('abc');
  });
});
