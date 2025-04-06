export function normalizeToSentenceCase(input: string): string {
    if (!input) return input;
    return input
        .replace(/([A-Z]{2,})([A-Z][a-z])/g, "$1 $2")
        .replace(/([a-z])([A-Z]{2,})/g, "$1 $2")
        .replace(/[_\-\s]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
    // .replace(/([A-Z])/g, " $1")
    // .replace(/[_-]+/g, " ")
    // .trim()
    // .replace(/\s+/g, " ")
    // .replace(/^./, (match) => match.toUpperCase())
    // .replace(/\s./g, (match) => match.toLowerCase());
}

export function extractRouterVariableName(content: string): string | null {
    const match = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*Router\(\)/.exec(
        content,
    );
    return match?.[1] || null;
}

export function cleanCodeContent(content: string): string {
    return content
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .trim();
}
