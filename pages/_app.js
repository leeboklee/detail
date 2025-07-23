import { AppContextProvider } from './context/AppContext';
import { Providers } from './providers';
import Head from 'next/head';
import Script from 'next/script';
import './globals.css';
// import './styles/styles.css';
// import './styles/hotel-preview.css';

function MyApp({ Component, pageProps }) {
  // 브라우저 콘솔 오류 자동 감지
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // JavaScript 오류 감지
    window.onerror = function(message, source, lineno, colno, error) {
      console.error('🚨 자동 감지된 오류:', {
        message,
        source,
        lineno,
        colno,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
      
      // 서버로 오류 전송 (선택사항)
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'javascript_error',
          message,
          source,
          lineno,
          colno,
          stack: error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.log('오류 로그 전송 실패:', err));
    };

    // Promise 오류 감지
    window.addEventListener('unhandledrejection', function(event) {
      console.error('🚨 자동 감지된 Promise 오류:', {
        reason: event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
      
      // 서버로 오류 전송 (선택사항)
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'promise_error',
          reason: event.reason?.toString(),
          stack: event.reason?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.log('오류 로그 전송 실패:', err));
    });

    // React 오류 경계 (선택사항)
    if (typeof window !== 'undefined') {
      window.addEventListener('error', function(event) {
        console.error('🚨 React 오류 감지:', event.error);
      });
    }
  }

  return (
    <AppContextProvider>
      <Head>
        <meta charSet="utf-8" />
        <title>Hotel Detail Page Generator</title>
        <meta name="description" content="호텔 상세 페이지 생성기" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="http://localhost: {process.env.PORT || 34343}" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Hotel Detail Page Generator" />
        <meta property="og:description" content="호텔 상세 페이지 생성기" />
        <meta property="og:url" content="http://localhost: {process.env.PORT || 34343}" />
        <meta property="og:type" content="website" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      <Providers>
        <Component {...pageProps} />
      </Providers>
      <Script src="/js/Common.js" strategy="lazyOnload" />
    </AppContextProvider>
  );
}

export default MyApp; 