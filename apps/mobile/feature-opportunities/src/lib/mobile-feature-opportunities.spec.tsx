import React from 'react';
import { render } from '@testing-library/react-native';

import MobileFeatureOpportunities from './mobile-feature-opportunities';

describe('MobileFeatureOpportunities', () => {
  it('should render successfully', () => {
    const { root } = render(<MobileFeatureOpportunities />);
    expect(root).toBeTruthy();
  });
});
