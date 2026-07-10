#!/usr/bin/env node

const { createHash } = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const snapshotPath = path.join(root, 'data', 'generated', 'emuseum-artifacts.json')
const publicRoot = path.join(root, 'public')
const expectedIds = new Set(Array.from({ length: 100 }, (_, index) => index + 1))
const supportedLocales = ['ko', 'en', 'zh', 'ja', 'th']

function fail(message) {
  console.error(`[verify:emuseum] ${message}`)
  process.exit(1)
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoTimestamp(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && !Number.isNaN(Date.parse(value))
}

function isReviewDate(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && Date.parse(`${value}T00:00:00Z`) <= Date.now()
}

function isHttpsUrl(value) {
  if (!isNonEmptyString(value)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.hash
  } catch {
    return false
  }
}

function validateLocalizedText(value, field, id) {
  if (!isObject(value)) fail(`Artifact ${id} ${field} must be localized text.`)
  for (const locale of supportedLocales) {
    if (!isNonEmptyString(value[locale])) {
      fail(`Artifact ${id} ${field}.${locale} is missing.`)
    }
  }
}

function validateMetadataRights(metadata, artifactId) {
  if (!isObject(metadata)) fail(`Artifact ${artifactId} has no metadata rights.`)
  if (metadata.basis !== 'kogl-1' && metadata.basis !== 'permission') {
    fail(`Artifact ${artifactId} has an unsupported metadata rights basis.`)
  }
  if (![1, 2, 3, 4, null].includes(metadata.koglType)) {
    fail(`Artifact ${artifactId} has an invalid KOGL type.`)
  }
  if (metadata.basis === 'kogl-1') {
    if (metadata.koglType !== 1) fail(`Artifact ${artifactId} claims KOGL type 1 inconsistently.`)
    if (!isHttpsUrl(metadata.licenseUrl) || new URL(metadata.licenseUrl).hostname !== 'www.kogl.or.kr') {
      fail(`Artifact ${artifactId} has an invalid KOGL license URL.`)
    }
  }
  if (
    !isNonEmptyString(metadata.attribution)
    || metadata.thirdPartyRightsIncluded !== true
    || !isHttpsUrl(metadata.evidenceUrl)
    || !isReviewDate(metadata.verifiedAt)
    || !isNonEmptyString(metadata.reviewer)
  ) {
    fail(`Artifact ${artifactId} has an incomplete metadata rights review.`)
  }
}

function resolvePublicImage(src, artifactId) {
  if (typeof src !== 'string' || !/^\/artworks\/emuseum\/[A-Za-z0-9._/-]+$/.test(src)) {
    fail(`Artifact ${artifactId} image must be a versioned local eMuseum path.`)
  }
  const resolved = path.resolve(publicRoot, `.${src}`)
  if (!resolved.startsWith(`${publicRoot}${path.sep}`)) {
    fail(`Artifact ${artifactId} image escapes the public directory.`)
  }
  return resolved
}

function validateImage(image, artifactId, hashOwners, sourceImageIds) {
  if (!isObject(image)) fail(`Artifact ${artifactId} has an invalid image record.`)
  if (!isNonEmptyString(image.sourceImageId) || !/^[A-Za-z0-9]+$/.test(image.sourceImageId)) {
    fail(`Artifact ${artifactId} has an invalid source image id.`)
  }
  if (sourceImageIds.has(image.sourceImageId)) {
    fail(`Artifact ${artifactId} repeats a source image id.`)
  }
  sourceImageIds.add(image.sourceImageId)

  if (!Number.isInteger(image.order) || image.order < 0 || image.order > 99) {
    fail(`Artifact ${artifactId} has an invalid image order.`)
  }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(image.contentType)) {
    fail(`Artifact ${artifactId} has an unsupported image content type.`)
  }
  if (typeof image.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(image.sha256)) {
    fail(`Artifact ${artifactId} has an invalid image hash.`)
  }
  if (image.rightsStatus !== 'kogl-1' && image.rightsStatus !== 'third-party-permitted') {
    fail(`Artifact ${artifactId} has an unapproved image rights status.`)
  }
  if (
    !isNonEmptyString(image.credit)
    || !isHttpsUrl(image.evidenceUrl)
    || !isReviewDate(image.verifiedAt)
  ) {
    fail(`Artifact ${artifactId} has an incomplete image rights review.`)
  }
  if (image.rightsStatus === 'third-party-permitted' && !isNonEmptyString(image.rightsHolder)) {
    fail(`Artifact ${artifactId} is missing the third-party image rights holder.`)
  }

  const imagePath = resolvePublicImage(image.src, artifactId)
  if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) {
    fail(`Artifact ${artifactId} references a missing image file.`)
  }
  const actualHash = createHash('sha256').update(fs.readFileSync(imagePath)).digest('hex')
  if (actualHash !== image.sha256) fail(`Artifact ${artifactId} image hash does not match the file.`)

  const previousArtifactId = hashOwners.get(image.sha256)
  if (previousArtifactId !== undefined && previousArtifactId !== artifactId) {
    fail(`Artifacts ${previousArtifactId} and ${artifactId} map to identical image bytes.`)
  }
  hashOwners.set(image.sha256, artifactId)
}

function validateArtifact(artifact, ids, sourceIds, hashOwners) {
  if (!isObject(artifact) || !Number.isInteger(artifact.id) || !expectedIds.has(artifact.id)) {
    fail('Every artifact must have an integer id from 1 to 100.')
  }
  if (ids.has(artifact.id)) fail(`Artifact id ${artifact.id} is duplicated.`)
  ids.add(artifact.id)
  validateLocalizedText(artifact.name, 'name', artifact.id)
  validateLocalizedText(artifact.period, 'period', artifact.id)
  validateLocalizedText(artifact.description, 'description', artifact.id)
  validateLocalizedText(artifact.detailedInfo, 'detailedInfo', artifact.id)
  if (!isNonEmptyString(artifact.category) || !isNonEmptyString(artifact.hall)) {
    fail(`Artifact ${artifact.id} has no category or hall.`)
  }

  const source = artifact.source
  if (
    !isObject(source)
    || source.provider !== 'emuseum'
    || source.datasetId !== '3036708'
    || !isNonEmptyString(source.sourceId)
    || !/^[A-Za-z0-9]+$/.test(source.sourceId)
    || !isNonEmptyString(source.officialNameKr)
    || !isNonEmptyString(source.museumCode)
    || !isNonEmptyString(source.museumName)
    || !isHttpsUrl(source.datasetUrl)
    || !isIsoTimestamp(source.syncedAt)
    || typeof source.normalizedSha256 !== 'string'
    || !/^[a-f0-9]{64}$/.test(source.normalizedSha256)
  ) {
    fail(`Artifact ${artifact.id} has invalid eMuseum provenance.`)
  }
  if (sourceIds.has(source.sourceId)) fail(`Artifact ${artifact.id} repeats an eMuseum source id.`)
  sourceIds.add(source.sourceId)

  if (!isObject(artifact.rights) || artifact.rights.imagesHaveSeparateRights !== true) {
    fail(`Artifact ${artifact.id} does not separate metadata and image rights.`)
  }
  validateMetadataRights(artifact.rights.metadata, artifact.id)

  if (!Array.isArray(artifact.images) || artifact.images.length === 0) {
    fail(`Artifact ${artifact.id} has no verified images.`)
  }
  if (artifact.image !== artifact.images[0].src) {
    fail(`Artifact ${artifact.id} representative image does not match its first image.`)
  }
  const sourceImageIds = new Set()
  for (const image of artifact.images) {
    validateImage(image, artifact.id, hashOwners, sourceImageIds)
  }
}

let serialized
try {
  serialized = fs.readFileSync(snapshotPath, 'utf8')
} catch {
  fail('data/generated/emuseum-artifacts.json is missing.')
}

if (/serviceKey|MUSEUM_API_KEY/i.test(serialized)) {
  fail('The generated snapshot contains a forbidden secret-bearing field.')
}

let snapshot
try {
  snapshot = JSON.parse(serialized)
} catch {
  fail('The generated snapshot is not valid JSON.')
}

if (!isObject(snapshot) || snapshot.schemaVersion !== 1 || snapshot.datasetId !== '3036708') {
  fail('The generated snapshot header is invalid.')
}
if (typeof snapshot.verified !== 'boolean') fail('The generated snapshot verified flag is invalid.')

if (!snapshot.verified) {
  if (snapshot.recordCount !== 0 || !Array.isArray(snapshot.records) || snapshot.records.length !== 0) {
    fail('An unverified published snapshot must be empty.')
  }
  if (process.env.MUSEUM_DATA_VERIFIED === 'true') {
    fail('MUSEUM_DATA_VERIFIED=true requires a complete verified snapshot.')
  }
  console.log('[verify:emuseum] No verified snapshot is published; indexing must remain disabled.')
  process.exit(0)
}

if (
  !isIsoTimestamp(snapshot.generatedAt)
  || snapshot.recordCount !== 100
  || !Number.isInteger(snapshot.requestCount)
  || snapshot.requestCount < 1
  || snapshot.requestCount > 800
  || !Array.isArray(snapshot.records)
  || snapshot.records.length !== 100
) {
  fail('The verified snapshot metadata or record count is invalid.')
}

const ids = new Set()
const sourceIds = new Set()
const hashOwners = new Map()
for (const artifact of snapshot.records) {
  validateArtifact(artifact, ids, sourceIds, hashOwners)
}
if (ids.size !== expectedIds.size || [...expectedIds].some((id) => !ids.has(id))) {
  fail('The verified snapshot does not cover ids 1 through 100 exactly once.')
}

console.log(`[verify:emuseum] Verified ${snapshot.records.length} artifacts and ${hashOwners.size} image files.`)
