module.exports = async function () {
    this.on('getCurrentUser', async (req) => {
      const user = req.user;
      const hasAdminRole = !!(user.roles && user.roles.Admin);
      return {
        id: user.id,
        email: user.attr?.email || "Not available",
        roles: hasAdminRole ? "Admin" : "Viewer"
      };
    });
  };