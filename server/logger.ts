export function log(message: string, source = "server") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${time} [${source}] ${message}`);
}
