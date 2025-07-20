#!/usr/bin/env zsh
##############################################################################
# 설정 영역 (필요 시만 수정)
GITHUB_USER="Hand-Surgeon"
REPO_NAME="koreanmuseumapp-2c"
BRANCH="main"                           # 다른 브랜치를 기본으로 푸시하려면 변경
REPO_DIR="$(pwd)"                       # 현재 디렉토리 사용
##############################################################################

set -e  # 에러 발생 시 즉시 종료

# 1) SSH 키가 없으면 자동 생성
if [[ ! -f ~/.ssh/id_ed25519 ]]; then
  print "🔑 SSH 키가 없어 자동 생성합니다..."
  ssh-keygen -t ed25519 -C "$USER@$(hostname)" -N "" -f ~/.ssh/id_ed25519
fi

# 2) 공개키 클립보드 복사 & GitHub SSH 등록 페이지 열기
pbcopy < ~/.ssh/id_ed25519.pub
open "https://github.com/settings/ssh/new"
print "\n✅ 공개키가 클립보드에 복사되었습니다."
print "🖱  브라우저에서 Key 칸에 ⌘V 붙여넣기 → Add SSH key 클릭 후 Enter"

read -r "?👉 등록이 끝났으면 Enter 를 눌러 계속: "

# 3) 현재 디렉토리가 이미 git 레포이므로 원격 URL만 변경
cd "$REPO_DIR"

# 4) 원격 URL을 SSH 형식으로 강제 변경
git remote set-url origin "git@github.com:${GITHUB_USER}/${REPO_NAME}.git"

# 5) GitHub 연결 테스트
ssh -T git@github.com || { print "❌ SSH 인증 실패!"; exit 1 }

# 6) 첫 push (커밋이 있을 때만)
if [[ -n "$(git status --porcelain)" ]]; then
  print "📂 변경 사항이 있으나 커밋되지 않았습니다."
  print "   git add/commit 후 다시 실행하거나 수동으로 push 하세요."
else
  print "🚀 git push origin $BRANCH 실행..."
  git push origin "$BRANCH" || git push -u origin "$(git branch --show-current)"
fi

print "\n🎉 모든 작업이 완료되었습니다!"
##############################################################################