# 프론트엔드 배포

이 저장소는 프론트엔드 서버(43.203.202.44)의 `storynation`(라이브), `storynation-qa`(QA) 컨테이너 원본 소스다.

## 서버 구성

| 항목 | 값 |
|---|---|
| 서버 | 43.203.202.44 (2 vCPU, RAM 908MB + swap 2GB) |
| 이미지 저장소 | Docker Hub (서버 root 계정이 로그인되어 있음) |
| 권한 | `ubuntu` 계정은 docker 그룹이 아니므로 `sudo docker` 사용 |

| 컨테이너 | 이미지 | sn-network IP | 포트 | 메모리 제한 |
|---|---|---|---|---|
| `storynation` | `storynation/storynation:latest` | 192.168.1.100 | 8060 → 3000 | 350m / swap 700m |
| `storynation-qa` | `storynation/storynation-qa:latest` | 192.168.1.101 | 8070 → 3000 | 300m / swap 600m |

두 컨테이너 모두 `--restart unless-stopped`. 같은 서버에 `chat-live`(8040)도 떠 있다(`chat-qa`(8050)는 2026-09-29 중지).

채팅 화면은 `NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS`(`https://chat.storynation.co.kr/character/chat`)로 이동해 연다. `.env_release`·`.env_local` 모두 같은 값이라 **라이브·QA 웹 모두 chat-live 를 호출한다.** 채팅 배포는 `chat-story-nation/docs/deployment.md` 참고.

> 서버 RAM 이 908MB 라서 서버에서 `next build` 를 돌리면 메모리가 부족하다. **빌드는 반드시 로컬에서** 하고 서버는 pull 만 한다.

## 빌드

이미지 태그는 서버에서 쓰는 이름과 같아야 한다. QA 는 `storynation/storynation-qa` 저장소다(`storynation/storynation:qa` 아님).

```bash
# QA
docker build -f Dockerfile_Qa -t storynation/storynation-qa:latest .

# 라이브
docker build -f Dockerfile_Release -t storynation/storynation:latest .
```

롤백에 대비해 git 커밋 해시 태그도 함께 붙여 push 하는 것을 권장한다.

```bash
TAG=$(git rev-parse --short HEAD)
docker tag storynation/storynation-qa:latest storynation/storynation-qa:$TAG
docker push storynation/storynation-qa --all-tags
```

## 로컬 확인

서버와 같은 포트·메모리 제한으로 띄워 본다.

```bash
docker run -d --name storynation    -p 8060:3000 --memory 350m --memory-swap 700m storynation/storynation:latest
docker run -d --name storynation-qa -p 8070:3000 --memory 300m --memory-swap 600m storynation/storynation-qa:latest
```

번들에 들어간 API 주소 확인:

```bash
docker exec storynation-qa sh -c 'grep -rhoE "https://[a-z-]*api\.universestationery\.com" .next | sort | uniq -c'
```

## 서버 교체

pull 을 먼저 끝내 두면 중단 시간은 `rm` ~ `run` 사이 몇 초다. QA 를 먼저 교체해 확인한 뒤 라이브를 교체한다.

```bash
# QA
sudo docker pull storynation/storynation-qa:latest
sudo docker rm -f storynation-qa
sudo docker run -d --name storynation-qa --network sn-network --ip 192.168.1.101 \
  -p 8070:3000 --memory 300m --memory-swap 600m --restart unless-stopped \
  storynation/storynation-qa:latest

# 라이브
sudo docker pull storynation/storynation:latest
sudo docker rm -f storynation
sudo docker run -d --name storynation --network sn-network --ip 192.168.1.100 \
  -p 8060:3000 --memory 350m --memory-swap 700m --restart unless-stopped \
  storynation/storynation:latest

sudo docker image prune -f
```

> 서버의 bash history 에 남은 `docker run` 명령에는 메모리 제한이 빠져 있다. 그대로 복사해 쓰지 말고 위 명령을 사용한다.

롤백은 위 `run` 명령의 이미지를 `storynation/storynation:<이전 TAG>` 로 바꿔 실행한다.

## Dockerfile 구조 (standalone)

`next.config.js` 에 `output: 'standalone'` 을 설정했고, `Dockerfile_Qa` 와 `Dockerfile_Release` 는 사용하는 env 파일만 다르고 구조가 같다.

| | 빌드 시 `.env` 로 복사하는 파일 |
|---|---|
| `Dockerfile_Qa` | `.env_local` |
| `Dockerfile_Release` | `.env_release` |

- 런타임 이미지에는 `.next/standalone`, `.next/static`, `public`, `.env` 만 담고 `node server.js` 로 실행한다(`HOSTNAME=0.0.0.0`, `PORT=3000`).
- 이미지 크기 1.78GB → 336MB, 기동 직후 메모리 약 33MB.
- 현재 `.env_local` 도 라이브 주소(`krapi.universestationery.com`, `chat.universestationery.com`)를 가리킨다. 즉 **QA 프론트도 라이브 API 를 호출한다.**

## env 값은 빌드 시점에 고정된다

- `NEXT_PUBLIC_*` 값은 `next build` 때 번들에 문자열로 들어간다.
- `next.config.js` 도 빌드 때 실행되며 rewrite 목적지 등은 `server.js` 에 문자열로 들어간다.
- 따라서 컨테이너의 `.env` 를 바꿔도 반영되지 않는다. **주소를 바꾸면 반드시 다시 빌드**한다.

이전 `Dockerfile_Qa` 는 빌드 때 `.env` 를, 런타임에는 `.env_local` 을 써서 번들 값과 런타임 env 가 서로 달랐다. 지금은 빌드 전에 복사하도록 고쳤다.

## `/nakama` rewrite

`next.config.js` 의 `/nakama/:path*` rewrite 목적지는 `https://chat.universestationery.com/:path*` 이다(이전 `http://qauschat.storynation.io:443` 은 응답이 없고, `http://…:443` 형식은 TLS 포트에 평문 요청이라 400 이 난다).

이 rewrite 는 **현재 코드에서 사용하지 않는다.** 채팅은 `app/(routes)/chat/[id]/page.tsx` 에서 `CHAT_URL` 과 443 포트, SSL 설정으로 Nakama 클라이언트가 채팅 서버에 직접 연결한다. 2025-03-19 커밋 `a0aff57` 에서 추가된 설정으로, 삭제하지 않고 유지한다.
