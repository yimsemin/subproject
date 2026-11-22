#!/bin/bash
# 더블클릭하면 사이트 미리보기가 켜지고, 이 창을 닫으면 꺼진다.
cd "$(dirname "$0")" || exit 1
printf '\033]0;subProject 미리보기 (이 창을 닫으면 꺼집니다)\007'

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js가 필요합니다. https://nodejs.org 에서 설치한 뒤 다시 실행하세요."
  read -r -p "엔터를 누르면 닫힙니다."
  exit 1
fi

# 이미 켜진 미리보기가 있으면 새로 띄우지 않고 기존 주소를 연다.
for port in $(seq 4173 4183); do
  if curl -fs --max-time 1 "http://127.0.0.1:$port/" 2>/dev/null | grep -q "<title>subProject"; then
    echo "이미 켜진 미리보기가 있습니다: http://127.0.0.1:$port/"
    open "http://127.0.0.1:$port/"
    sleep 2
    exit 0
  fi
done

# 비어 있는 첫 포트를 고른다.
for port in $(seq 4173 4183); do
  lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 || break
done

node scripts/build.mjs || { read -r -p "빌드에 실패했습니다. 엔터를 누르면 닫힙니다."; exit 1; }
echo "미리보기: http://127.0.0.1:$port/   (끄려면 이 창을 닫거나 Ctrl+C)"
(sleep 1; open "http://127.0.0.1:$port/") &
trap 'echo; echo "미리보기가 꺼졌습니다."' EXIT
PORT=$port node scripts/serve.mjs --watch
