import AppContainer from '@/components/AppContainer';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <AppContainer />
    </ErrorBoundary>
  );
}
