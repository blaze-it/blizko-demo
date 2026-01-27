#!/usr/bin/env node

/**
 * Syncs the version across all package.json files in the monorepo.
 * Usage: node scripts/sync-versions.mjs <version>
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const newVersion = process.argv[2]

if (!newVersion) {
	console.error('Error: Version argument required')
	console.error('Usage: node scripts/sync-versions.mjs <version>')
	process.exit(1)
}

console.log(`Syncing all packages to version ${newVersion}`)

// Update root package.json
const rootPkgPath = join(rootDir, 'package.json')
updatePackageVersion(rootPkgPath, newVersion)

// Update all packages in packages/
const packagesDir = join(rootDir, 'packages')
const packages = readdirSync(packagesDir).filter((name) => {
	const pkgPath = join(packagesDir, name)
	return statSync(pkgPath).isDirectory()
})

for (const pkg of packages) {
	const pkgJsonPath = join(packagesDir, pkg, 'package.json')
	try {
		updatePackageVersion(pkgJsonPath, newVersion)
	} catch (error) {
		console.warn(`Warning: Could not update ${pkgJsonPath}: ${error.message}`)
	}
}

console.log('Version sync complete!')

function updatePackageVersion(filePath, version) {
	const content = readFileSync(filePath, 'utf-8')
	const pkg = JSON.parse(content)
	const oldVersion = pkg.version
	pkg.version = version

	// Preserve formatting (tabs in this project)
	writeFileSync(filePath, `${JSON.stringify(pkg, null, '\t')}\n`)
	console.log(`  ${filePath}: ${oldVersion} -> ${version}`)
}
