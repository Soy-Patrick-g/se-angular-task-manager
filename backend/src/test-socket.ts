import * as net from "net";

const host = "ep-nameless-term-abecstd9-pooler.eu-west-2.aws.neon.tech";
const port = 5432;

console.log(`Checking connection to ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on("connect", () => {
  console.log("✅ Port 5432 is OPEN and reachable!");
  socket.destroy();
  process.exit(0);
});

socket.on("timeout", () => {
  console.error("❌ Connection TIMEOUT");
  socket.destroy();
  process.exit(1);
});

socket.on("error", (err) => {
  console.error("❌ Connection ERROR:", err.message);
  process.exit(1);
});

socket.connect(port, host);
