const UserModal = require("../Modal/Users");

const buildUserTree = async (userId, level = 0) => {
  const user = await UserModal.findById(userId).populate("downline");
  if (!user) return null;

  const userTree = {
    userId: user._id,
    name: user.Name,
    level,
    amount: user.rewards,
    Rank:user.Rank,
    downline: [],
  };

  for (const downlineUser of user.downline) {
    const downlineTree = await buildUserTree(downlineUser._id, level + 1);
    if (downlineTree) {
      userTree.downline.push(downlineTree);
    }
  }

  return userTree;
};

module.exports = buildUserTree;
