import React from 'react';
import { render } from '@testing-library/react-native';

import MobileFeatureAnalytics from './mobile-feature-analytics';

describe('MobileFeatureAnalytics', () => {
  it('should render successfully', () => {
    const { root } = render(<MobileFeatureAnalytics />);
    expect(root).toBeTruthy();
  });
});
