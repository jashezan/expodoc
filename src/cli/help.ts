export function helpCommand(): void {
    console.log(`
✅ ExpressDocgen:

A tool to generate API documentation automatically for Express.js applications.

Usage: expodoc [options]

Options:
--version  Show version
--help     Show help for a command
--init     Initialize the configuration file
--postman  Generate Postman collection from routes
--print    Print the routes in JSON format

Examples:
✓ $ expodoc --version
✓ $ expodoc --help
✓ $ expodoc --init
✓ $ expodoc --postman
✓ $ expodoc --print
`);
}
