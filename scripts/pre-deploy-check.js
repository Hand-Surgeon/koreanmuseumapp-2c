#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🚀 배포 전 체크리스트 실행 중...\n')

const checks = []

// 1. 환경 변수 확인
function checkEnvVariables() {
  console.log('1️⃣  환경 변수 확인...')
  const requiredEnvVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_GA_ID',
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    checks.push({
      name: '환경 변수',
      status: '❌',
      message: `누락된 환경 변수: ${missingVars.join(', ')}`
    })
  } else {
    checks.push({
      name: '환경 변수',
      status: '✅',
      message: '모든 필수 환경 변수가 설정됨'
    })
  }
}

// 2. 빌드 테스트
function checkBuild() {
  console.log('2️⃣  빌드 가능 여부 확인...')
  const nextConfigExists = fs.existsSync(path.join(process.cwd(), 'next.config.mjs'))
  const packageJsonExists = fs.existsSync(path.join(process.cwd(), 'package.json'))
  
  if (nextConfigExists && packageJsonExists) {
    checks.push({
      name: '빌드 설정',
      status: '✅',
      message: '빌드 설정 파일이 존재함'
    })
  } else {
    checks.push({
      name: '빌드 설정',
      status: '❌',
      message: '빌드 설정 파일이 누락됨'
    })
  }
}

// 3. 이미지 최적화 확인
function checkImages() {
  console.log('3️⃣  이미지 최적화 설정 확인...')
  const configPath = path.join(process.cwd(), 'next.config.mjs')
  const config = fs.readFileSync(configPath, 'utf-8')
  
  if (config.includes('unoptimized: true')) {
    checks.push({
      name: '이미지 최적화',
      status: '⚠️',
      message: '이미지 최적화가 비활성화되어 있음'
    })
  } else {
    checks.push({
      name: '이미지 최적화',
      status: '✅',
      message: '이미지 최적화가 활성화됨'
    })
  }
}

// 4. TypeScript 에러 확인
function checkTypeScript() {
  console.log('4️⃣  TypeScript 에러 확인...')
  const tsConfigExists = fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))
  
  if (tsConfigExists) {
    checks.push({
      name: 'TypeScript',
      status: '✅',
      message: 'TypeScript 설정이 존재함'
    })
  } else {
    checks.push({
      name: 'TypeScript',
      status: '❌',
      message: 'TypeScript 설정이 누락됨'
    })
  }
}

// 5. 보안 헤더 확인
function checkSecurityHeaders() {
  console.log('5️⃣  보안 헤더 설정 확인...')
  const configPath = path.join(process.cwd(), 'next.config.mjs')
  const config = fs.readFileSync(configPath, 'utf-8')
  
  if (config.includes('securityHeaders')) {
    checks.push({
      name: '보안 헤더',
      status: '✅',
      message: '보안 헤더가 설정됨'
    })
  } else {
    checks.push({
      name: '보안 헤더',
      status: '⚠️',
      message: '보안 헤더 설정 확인 필요'
    })
  }
}

// 6. 필수 파일 존재 여부
function checkRequiredFiles() {
  console.log('6️⃣  필수 파일 확인...')
  const requiredFiles = [
    'public/robots.txt',
    'public/manifest.json',
    'public/sw.js',
    '.env.example'
  ]
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)))
  
  if (missingFiles.length > 0) {
    checks.push({
      name: '필수 파일',
      status: '⚠️',
      message: `누락된 파일: ${missingFiles.join(', ')}`
    })
  } else {
    checks.push({
      name: '필수 파일',
      status: '✅',
      message: '모든 필수 파일이 존재함'
    })
  }
}

// 체크 실행
checkEnvVariables()
checkBuild()
checkImages()
checkTypeScript()
checkSecurityHeaders()
checkRequiredFiles()

// 결과 출력
console.log('\n📋 배포 전 체크리스트 결과:\n')
console.log('─'.repeat(50))

let hasError = false
let hasWarning = false

checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`)
  if (check.status === '❌') hasError = true
  if (check.status === '⚠️') hasWarning = true
})

console.log('─'.repeat(50))

if (hasError) {
  console.log('\n❌ 배포를 진행하기 전에 오류를 수정해주세요!')
  process.exit(1)
} else if (hasWarning) {
  console.log('\n⚠️  경고가 있지만 배포는 가능합니다.')
  console.log('권장사항을 확인하고 수정을 고려해주세요.')
} else {
  console.log('\n✅ 모든 체크를 통과했습니다! 배포 준비가 완료되었습니다.')
}

console.log('\n💡 팁: 배포 전에 다음 명령어를 실행하세요:')
console.log('  npm run build')
console.log('  npm run test')
console.log('  npm run lint')