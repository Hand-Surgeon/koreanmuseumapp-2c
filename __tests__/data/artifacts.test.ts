/** @jest-environment node */

import fs from 'node:fs'
import path from 'node:path'
import { artifacts } from '@/data/artifacts'

describe('artifact dataset integrity', () => {
  it('contains exactly one artifact for every id from 1 through 100', () => {
    const ids = artifacts.map((artifact) => artifact.id).sort((a, b) => a - b)

    expect(ids).toEqual(Array.from({ length: 100 }, (_, index) => index + 1))
  })

  it('references artwork files that exist in public', () => {
    const missing = artifacts
      .map((artifact) => artifact.image)
      .filter((image) => !fs.existsSync(path.join(process.cwd(), 'public', image)))

    expect(missing).toEqual([])
  })
})
