// This is a placeholder for authentication I decided not to build this
// out because auth wasn't mentioned, but wanted to include it to show how
// authentication might validated on request
async function checkAuth(req) {
  return true;
}

module.exports = {
  checkAuth,
};
