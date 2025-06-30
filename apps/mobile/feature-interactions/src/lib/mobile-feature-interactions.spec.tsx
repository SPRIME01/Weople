import React from 'react';
import { render } from '@testing-library/react-native';

import MobileFeatureInteractions from './mobile-feature-interactions';

describe('MobileFeatureInteractions', () => {
  it('should render successfully', () => {
    const { root } = render(<MobileFeatureInteractions />);
    expect(root).toBeTruthy();
  });
});
