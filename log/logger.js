function getTime() {
  const now = new Date();
  return now.toISOString().replace("T", " ").split(".")[0]; 
  // Ví dụ: 2025-08-28 08:35:10
}

function TLogger(message) {
  const logMessage = `[${getTime()}] ${message}\n`;

  // In ra console
  console.log(logMessage.trim());
}

module.exports = TLogger;
