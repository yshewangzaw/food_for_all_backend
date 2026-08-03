const bcrypt = require("bcrypt");
const sequelize = require("../config/database");

const userRepository = require("../repositories/userRepository");
const { createNetworkPathsForNewUser } = require("./networkPathRegistrationService");
const generateReferralCode = require("../utils/generateReferralCode");

const authService = {
  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash || user.password || "");
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    return { user };
  },

  register: async (data) => {
    const { fullName, email, phone, password, sponsorReferralCode } = data;

    const t = await sequelize.transaction();

    try {
      const existingUser = await userRepository.findByEmailOrPhone(email, phone, t);
      if (existingUser) {
        throw new Error("Email or phone already registered");
      }

      let sponsor = null;
      let depth = 0;

      if (sponsorReferralCode) {
        sponsor = await userRepository.findByReferralCode(sponsorReferralCode, t);
        if (!sponsor) {
          throw new Error("Invalid referral code");
        }
        depth = sponsor.depth + 1;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const referralCode = await generateReferralCode();

      const newUser = await userRepository.create(
        {
          fullName,
          email,
          phone,
          passwordHash,
          role: "MEMBER",
          referralCode,
          sponsorId: sponsor ? sponsor.id : null,
          depth,
          directReferralCount: 0,
          status: "PENDING",
          kycStatus: "NOT_SUBMITTED",
        },
        t
      );

      // Critical hook: builds the NetworkPath rows inside the same transaction
      await createNetworkPathsForNewUser(newUser, t);

      if (sponsor) {
        await userRepository.incrementDirectReferralCount(sponsor.id, t);
      }

      await t.commit();

      return newUser;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};

module.exports = authService;