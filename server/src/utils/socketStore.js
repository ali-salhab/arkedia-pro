/**
 * Singleton that holds the Socket.IO server instance so any controller
 * can emit events without needing to import from index.js (avoids circular deps).
 */
let _io = null;

function init(io) {
  _io = io;
}

function getIo() {
  return _io;
}

/**
 * Notify a specific user (by userId string) that their permissions changed.
 * The client joins "user:<userId>" room on connect.
 */
function emitPermissionsUpdated(userId, permissions) {
  if (!_io || !userId) return;
  _io.to(`user:${userId}`).emit("permissions:updated", { permissions });
}

module.exports = { init, getIo, emitPermissionsUpdated };
