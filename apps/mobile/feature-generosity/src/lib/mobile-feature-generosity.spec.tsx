import React from 'react';
import { render } from '@testing-library/react-native';

import MobileFeatureGenerosity from './mobile-feature-generosity';

describe('MobileFeatureGenerosity', () => {
  it('should render successfully', () => {
    const { root } = render(<MobileFeatureGenerosity />);
    expect(root).toBeTruthy();
  });
});
