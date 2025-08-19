import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{__html: `document.addEventListener('DOMContentLoaded',function(){var t=document.getElementsByTagName('title');for(var i=t.length-1;i>=0;i--){if(t[i].hasAttribute('data-rh')&&!t[i].textContent.trim()){t[i].remove();}}});`}} />
        <title>케이전시 - 외국인 구인구직 채용 플랫폼</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="외국인 구직자와 한국 기업을 연결하는 스마트 채용 매칭 플랫폼. 맞춤형 일자리 추천과 간편한 지원 시스템을 제공합니다." />
        <meta name="keywords" content="외국인 채용, 외국인 구인구직, 케이전시, kgency, 외국인 일자리, 한국 취업, 비자 취업" />
        
        {/* Open Graph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="케이전시(Kgency) - 외국인 구인구직 채용 플랫폼" />
        <meta property="og:description" content="외국인 구직자와 한국 기업을 연결하는 스마트 채용 매칭 플랫폼" />
        <meta property="og:url" content="https://kgency.co.kr" />
        <meta property="og:site_name" content="케이전시" />
        <meta property="og:locale" content="ko_KR" />
        
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}