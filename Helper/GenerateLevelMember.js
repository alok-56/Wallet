const UserModel = require("../Modal/Users");


 const getMembersAtLevel = async (referralCode, level) => {
  if (level === 0) return { totalBusiness: 0, members: [] };

  let levelMembers = await UserModel.find({ referredBy: referralCode });
  let totalBusiness = 0;

  if (level === 1) {
    totalBusiness = levelMembers.reduce(
      (acc, member) => acc + member.rewards,
      0
    );
    return { totalBusiness, members: levelMembers };
  }

  for (let i = 2; i <= level; i++) {
    const nextLevelMembers = [];
    let nextLevelBusiness = 0;

    for (let member of levelMembers) {
      const { totalBusiness: memberBusiness, members: nextDownline } =
        await getMembersAtLevel(member.referralCode, 1);
      nextLevelMembers.push(...nextDownline);
      nextLevelBusiness += memberBusiness;
    }

    totalBusiness = nextLevelBusiness;
    levelMembers = nextLevelMembers;
  }

  return { totalBusiness, members: levelMembers };
};

 const getAllLevelsBusiness = async (referralCode) => {
  let level = 1;
  let totalBusiness = 0;
  let allLevelsData = [];

  let membersAtCurrentLevel = await getMembersAtLevel(referralCode, level);

  while (membersAtCurrentLevel.members.length > 0) {
    totalBusiness += membersAtCurrentLevel.totalBusiness;

    allLevelsData.push({
      level: level,
      totalBusiness: membersAtCurrentLevel.totalBusiness,
      members: membersAtCurrentLevel.members,
    });

    level++;
    membersAtCurrentLevel = await getMembersAtLevel(referralCode, level);
  }

  return { totalBusiness, levels: allLevelsData };
};

module.exports = { getMembersAtLevel, getAllLevelsBusiness };
