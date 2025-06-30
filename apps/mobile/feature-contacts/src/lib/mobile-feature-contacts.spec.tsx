import React from 'react';
import { render } from '@testing-library/react-native';

import MobileFeatureContacts from './mobile-feature-contacts';

describe('MobileFeatureContacts', () => {
  it('should render successfully', () => {
    const { root } = render(<MobileFeatureContacts />);
    expect(root).toBeTruthy();
  });
});
