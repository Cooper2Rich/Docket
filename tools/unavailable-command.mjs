const [command, owner] = process.argv.slice(2);

if (!command || !owner) {
  console.error(
    "UNAVAILABLE_COMMAND_USAGE: command and owning work item are required",
  );
  process.exit(2);
}

console.error(
  `COMMAND_UNAVAILABLE: ${command} is created by ${owner}; it is not implemented by R1-FND-001-A.`,
);
process.exit(1);
