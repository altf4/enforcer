import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock ResultsTable which uses Webpack's require.context (unavailable in Jest)
jest.mock('./ResultsTable', () => ({
  StageIcon: () => null,
  ControllerTypeIcon: () => null,
  ResultIcons: () => null,
}));

// Mock slp-enforcer WASM module
jest.mock('slp-enforcer', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
  analyzeReplay: jest.fn(),
  isBoxController: jest.fn().mockReturnValue(false),
  isHandwarmer: jest.fn().mockReturnValue(false),
  isSlpMinVersion: jest.fn().mockReturnValue(false),
  getGameSettings: jest.fn(),
}));

// eslint-disable-next-line import/first
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  const dropText = screen.getByText(/drop slp files/i);
  expect(dropText).toBeInTheDocument();
});
