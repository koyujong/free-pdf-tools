/**
 * GitHub Actions에서 실행되는 자동 URL 색인 요청 스크립트 (PDF Tool용)
 * 
 * 동작 방식:
 * 1. git diff를 통해 lib/posts/**/*.tsx 경로 안의 새로 추가된 slug를 추출
 * 2. 구글 Indexing API로 생성/업데이트 요청 전송
 * 3. 네이버 IndexNow API로 제출 요청 전송
 */

const { execSync } = require('child_process');
const axios = require('axios');
const { google } = require('googleapis');

// 1. 환경 변수 확인
const GCP_KEY_JSON = process.env.GCP_KEY_JSON;
const NAVER_KEY = process.env.NAVER_INDEXNOW_KEY || 'fc1e3ad82010475381daf9846e627fdd';

const BASE_URL = 'https://freepdf.4kdrivewalk.com'; // app/sitemap.ts 에 명시된 DOMAIN 기준
const BEFORE_SHA = process.env.BEFORE_SHA;
const AFTER_SHA = process.env.AFTER_SHA;

if (!GCP_KEY_JSON) {
  console.error('❌ GCP_KEY_JSON 시크릿이 설정되지 않았습니다.');
  process.exit(1);
}

// 2. 변경된 slug 추출 로직
function getNewSlugs() {
  try {
    console.log(`🔍 변경 사항 검색: ${BEFORE_SHA} -> ${AFTER_SHA}`);
    
    let diffCommand;
    if (!BEFORE_SHA || BEFORE_SHA.match(/^0+$/)) {
      console.log('⚠️ 이전 커밋 정보가 없어 가장 최근 커밋 기준(HEAD~1)으로 변경 사항을 찾습니다.');
      diffCommand = `git diff -U0 HEAD~1 HEAD -- lib/posts/*.tsx`;
    } else {
      diffCommand = `git diff -U0 ${BEFORE_SHA} ${AFTER_SHA} -- lib/posts/*.tsx`;
    }

    const diffOutput = execSync(diffCommand, { encoding: 'utf-8' });
    
    const newSlugs = new Set();
    const lines = diffOutput.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('+') && line.includes('slug:')) {
        const match = line.match(/slug:\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
          newSlugs.add(match[1]);
        }
      }
    }
    
    return Array.from(newSlugs);
  } catch (error) {
    if (error.stdout) {
       console.log('diff output:', error.stdout.toString());
    }
    console.error('❌ 변경사항 추출 실패:', error.message);
    return [];
  }
}

async function getGoogleAuthClient() {
  const credentials = JSON.parse(GCP_KEY_JSON);
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  await auth.authorize();
  return auth;
}

async function notifyGoogle(authClient, url) {
  const indexing = google.indexing('v3');
  try {
    const res = await indexing.urlNotifications.publish({
      auth: authClient,
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    console.log(`✅ [Google] 성공: ${url}`);
  } catch (error) {
    console.error(`❌ [Google] 실패: ${url}`);
    if (error.response && error.response.data) {
      console.error(error.response.data.error.message);
    } else {
      console.error(error.message);
    }
  }
}

async function notifyNaver(urls) {
  try {
    // 네이버는 base url domain 호스트를 보내야 함
    const host = BASE_URL.replace(/^https?:\/\//, '');
    const response = await axios.post(
      'https://searchadvisor.naver.com/indexnow',
      {
        host: host, 
        key: NAVER_KEY,
        keyLocation: `${BASE_URL}/${NAVER_KEY}.txt`,
        urlList: urls
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      console.log(`✅ [Naver] 성공: ${urls.length}개 URL 제출 완료`);
    } else {
      console.error(`❌ [Naver] 실패: 상태 코드 ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ [Naver] 요청 중 오류:`, error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

async function run() {
  console.log('🚀 블로그 자동 색인 스크립트 시작');
  
  const slugs = getNewSlugs();
  
  if (slugs.length === 0) {
    console.log('ℹ️ 새로 추가되거나 변경된 블로그 글(slug)이 없습니다. 종료합니다.');
    return;
  }
  
  console.log(`📝 총 ${slugs.length}개의 새로운 슬러그 발견:`, slugs);
  
  // URL 조합 (encodeURIComponent 활용)
  const urls = slugs.map(slug => `${BASE_URL}/blog/${encodeURIComponent(slug)}`);
  
  console.log('\\n🌐 색인 요청할 URL 목록:');
  urls.forEach(u => console.log(` - ${u}`));
  console.log('');
  
  try {
    const authClient = await getGoogleAuthClient();
    for (const url of urls) {
      await notifyGoogle(authClient, url);
    }
  } catch (authError) {
    console.error('❌ 구글 인증 실패:', authError.message);
  }
  
  console.log('');
  
  await notifyNaver(urls);
  
  console.log('\\n✨ 모든 색인 요청 작업이 완료되었습니다!');
}

run();
