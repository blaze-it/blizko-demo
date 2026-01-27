import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import * as esbuild from 'esbuild'

// Read package.json to get dependencies
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// Get all dependencies except @blizko/* (workspace packages should be bundled)
const externalDeps = Object.keys(pkg.dependencies || {})
	.filter((dep) => !dep.startsWith('@blizko/'))
	.concat(
		Object.keys(pkg.devDependencies || {}).filter(
			(dep) => !dep.startsWith('@blizko/'),
		),
	)

// Build with esbuild
await esbuild.build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	platform: 'node',
	target: 'node22',
	outdir: 'dist',
	format: 'esm',
	external: externalDeps,
})

// Generate TypeScript declarations for type exports
console.log('Generating type declarations...')
execSync('npx tsc --declaration --emitDeclarationOnly --outDir dist', {
	stdio: 'inherit',
})

console.log('Build complete')
