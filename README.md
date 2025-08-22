# 🎵 소라방 (소리 라디오 방)

웹 기반 음성 디지털 편지와 감성형 라디오 서비스

## ✨ 주요 기능

### 📻 감성 라디오
- 실시간 음악 스트리밍
- 감성적인 플레이리스트
- 인터랙티브 플레이어 컨트롤
- 볼륨 조절 및 트랙 네비게이션

### 💌 음성 편지
- 음성 메시지 녹음 및 재생
- 텍스트 메시지와 함께 전송
- 받은 편지함 관리
- 읽음/안읽음 상태 표시

### ✍️ 편지 작성
- 실시간 음성 녹음
- 녹음 시간 표시
- 미리듣기 기능
- 텍스트 메시지 추가 옵션

## 🛠 기술 스택

- **Frontend**: Next.js 15, TypeScript, React
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Audio**: Web Audio API, MediaRecorder API

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
sorabang/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── RadioPlayer.tsx      # 라디오 플레이어
│       ├── VoiceLetter.tsx      # 음성편지 뷰어
│       └── LetterComposer.tsx   # 편지 작성기
├── public/
│   └── audio/                   # 오디오 파일들
└── ...
```

## 🎨 디자인 특징

- **글래스모피즘**: 반투명 배경과 블러 효과
- **그라디언트**: 보라색-핑크색 그라디언트 테마
- **애니메이션**: 부드러운 전환 효과와 인터랙션
- **반응형**: 모바일과 데스크톱 모두 지원

## 🔊 오디오 기능

### 지원 형식
- MP3, WAV, OGG
- 실시간 녹음 (MediaRecorder API)
- 오디오 재생 제어

### 브라우저 호환성
- Chrome, Firefox, Safari, Edge
- 마이크 권한 필요 (음성 녹음 시)

## 📱 반응형 디자인

- 모바일 우선 설계
- 태블릿 및 데스크톱 최적화
- 터치 친화적 인터페이스

## 🔒 개인정보 보호

- 음성 데이터는 로컬에서만 처리
- 서버 전송 시 사용자 동의 필요
- 브라우저 보안 정책 준수

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 연락처

프로젝트 링크: [https://github.com/yourusername/sorabang](https://github.com/yourusername/sorabang)

---

💝 **소라방**에서 따뜻한 음성 편지를 주고받으세요!
