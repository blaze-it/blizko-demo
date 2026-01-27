/**
 * Semantic Release Configuration
 *
 * Fixed/locked versioning strategy - all packages share the same version.
 * Triggered on push to master branch.
 */
module.exports = {
	branches: ['master'],
	// biome-ignore lint/suspicious/noTemplateCurlyInString: semantic-release uses this format
	tagFormat: 'v${version}',
	plugins: [
		// 1. Analyze commits to determine version bump
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'conventionalcommits',
				releaseRules: [
					{ type: 'feat', release: 'minor' },
					{ type: 'fix', release: 'patch' },
					{ type: 'perf', release: 'patch' },
					{ type: 'refactor', release: 'patch' },
					{ type: 'docs', release: false },
					{ type: 'style', release: false },
					{ type: 'chore', release: false },
					{ type: 'test', release: false },
					{ type: 'build', release: false },
					{ type: 'ci', release: false },
					// Breaking changes (!) always trigger major
					{ breaking: true, release: 'major' },
				],
			},
		],

		// 2. Generate release notes from commits
		[
			'@semantic-release/release-notes-generator',
			{
				preset: 'conventionalcommits',
				presetConfig: {
					types: [
						{ type: 'feat', section: 'Features' },
						{ type: 'fix', section: 'Bug Fixes' },
						{ type: 'perf', section: 'Performance Improvements' },
						{ type: 'refactor', section: 'Code Refactoring' },
						{ type: 'docs', section: 'Documentation', hidden: true },
						{ type: 'style', section: 'Styles', hidden: true },
						{ type: 'chore', section: 'Chores', hidden: true },
						{ type: 'test', section: 'Tests', hidden: true },
						{ type: 'build', section: 'Build System', hidden: true },
						{ type: 'ci', section: 'CI', hidden: true },
					],
				},
			},
		],

		// 3. Create GitHub release with release notes
		[
			'@semantic-release/github',
			{
				successComment: false,
				failComment: false,
				labels: false,
				releasedLabels: false,
			},
		],
	],
}
