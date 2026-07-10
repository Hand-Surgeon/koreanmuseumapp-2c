#!/usr/bin/env node

const { spawnSync } = require('node:child_process')
const fs = require('node:fs')

const requiredFiles = [
  'app/robots.ts',
  'public/manifest.json',
  'public/sw.js',
  '.env.example',
]

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file))

if (missingFiles.length > 0) {
  console.error(`Missing required files: ${missingFiles.join(', ')}`)
  process.exit(1)
}

const checks = [
  ['eMuseum snapshot', ['run', 'verify:emuseum']],
  ['TypeScript', ['run', 'type-check']],
  ['Tests', ['test', '--', '--runInBand']],
  ['Production build', ['run', 'build']],
]

for (const [name, args] of checks) {
  console.log(`\n[pre-deploy] ${name}`)
  const result = spawnSync('npm', args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    console.error(`\n[pre-deploy] Failed: ${name}`)
    process.exit(result.status || 1)
  }
}

console.log('\n[pre-deploy] All checks passed.')
