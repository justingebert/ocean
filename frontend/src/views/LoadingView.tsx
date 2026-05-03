import React from 'react';

import AppLayout from '../layouts/AppLayout';

/**
 * Props for the `LoadingView` component.
 * Currently, this component does not accept any props.
 */
interface LoadingViewProps {}
/**
 * A simple loading screen that renders inside the application layout.
 * - Displays a loading indicator or message when content is being fetched or initialized.
 * - Uses `AppLayout` to maintain a consistent UI structure.
 */
const LoadingView: React.FC<LoadingViewProps> = () => {
  return (
    <AppLayout selectedNavigation="">LoadingView</AppLayout>
  );
}

export default LoadingView;