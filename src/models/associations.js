const User = require("./User");
const NetworkPath = require("./NetworkPath");

// self-referencing sponsor chain
User.belongsTo(User, { as: "sponsor", foreignKey: "sponsorId" });
User.hasMany(User, { as: "referrals", foreignKey: "sponsorId" });

// closure table
NetworkPath.belongsTo(User, { as: "ancestor", foreignKey: "ancestorId" });
NetworkPath.belongsTo(User, { as: "descendant", foreignKey: "descendantId" });

User.hasMany(NetworkPath, { as: "descendantPaths", foreignKey: "ancestorId" });
User.hasMany(NetworkPath, { as: "ancestorPaths", foreignKey: "descendantId" });

module.exports = { User, NetworkPath };