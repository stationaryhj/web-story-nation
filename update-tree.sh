#!/bin/bash

# 출력 파일 경로 설정
OUTPUT_FILE="docs/tree.md"

# docs 디렉토리가 없다면 생성
mkdir -p docs

# PowerShell 명령어 실행
powershell -Command "
\$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Get-ChildItem -Recurse -Depth 30 | 
  Where-Object { 
    # 필수 제외 디렉토리만 필터링
    \$_.FullName -notmatch 'node_modules|.git|.next|dist|build|coverage' -and 
    # 개발 관련 파일만 포함
    (\$_.Extension -match '\.(tsx|ts|js|jsx|md|mdx|json|config.js|config.ts)$' -or \$_.PSIsContainer)
  } | 
  ForEach-Object { 
    \$depth = (\$_.FullName.Split('\').Length - (\$PWD.Path.Split('\').Length))
    \$indent = '  ' * (\$depth - 1)
    if (\$_.PSIsContainer) {
      \$indent + '├─ ' + \$_.Name + '/'
    } else {
      \$indent + '│  └─ ' + \$_.Name
    }
  } | 
  Out-File -FilePath '$OUTPUT_FILE' -Encoding UTF8
"

echo "프로젝트 구조가 $OUTPUT_FILE 에 저장되었습니다."