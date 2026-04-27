const sessions = {};

export function getHistory(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }
  return sessions[sessionId];
}

export function addMessage(sessionId, role, content) {
  const history = getHistory(sessionId);
  history.push({ role, content });

  // limit memory (last 10 messages)
  if (history.length > 10) {
    history.shift();
  }
}