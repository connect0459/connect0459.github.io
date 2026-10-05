const OFFLINE_TOLERANT_COMMANDS: ReadonlySet<string> = new Set([
	'dev',
	'check',
]);

export function canReuseStoredFeed(
	argv: readonly string[],
	storedEntryCount: number,
): boolean {
	const command = argv.find((arg) => !arg.startsWith('-'));
	return (
		command !== undefined &&
		OFFLINE_TOLERANT_COMMANDS.has(command) &&
		storedEntryCount > 0
	);
}
