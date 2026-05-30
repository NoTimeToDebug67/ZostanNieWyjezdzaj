/**
 * Centralized mock user data.
 * In a real app this would come from an API / local storage / auth context.
 */

const userData = {
  name: 'Aniu',
  village: 'Tymbark',
  points: 340,
  nextRewardThreshold: 500,

  // Activity stats
  stats: {
    reports: 7,
    initiatives: 3,
    votes: 12,
  },

  // Events the user signed up for
  joinedEvents: [
    {
      id: 'ev1',
      title: 'Piknik sąsiedzki w parku',
      date: new Date(Date.now() + 22 * 60 * 60 * 1000), // ~22h from now
      location: 'Park w Tymbarku',
    },
    {
      id: 'ev2',
      title: 'Zbiórka darów w remizie OSP',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      location: 'Remiza OSP Tymbark',
    },
    {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', // Sąsiedzkie Repair Cafe w remizie
      title: 'Sąsiedzkie Repair Cafe w remizie',
      date: new Date('2026-06-15T15:00:00'),
      location: 'Remiza OSP Tymbark',
    },
    {
      id: 'past-1',
      title: 'Warsztaty Pieczenia Chleba KGW',
      date: new Date('2026-06-12T10:00:00'),
      location: 'Świetlica Wiejska, Piekiełko',
    }
  ],

  // Available rewards / discounts
  rewards: [
    {
      id: 'r1',
      title: 'Piekarnia u Kasi',
      discount: '-15%',
      description: 'Na wszystkie wypieki',
      validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      emoji: '🥐',
    },
    {
      id: 'r2',
      title: 'Restauracja Pod Lipą',
      discount: '-10%',
      description: 'Na obiady w tygodniu',
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      emoji: '🍽️',
    },
    {
      id: 'r3',
      title: 'Sklep Ogrodniczy',
      discount: '-20%',
      description: 'Na nasiona i sadzonki',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      emoji: '🌱',
    },
  ],

  // Milestones / badges
  recentBadge: null, // e.g. { name: 'Aktywny Mieszkaniec', emoji: '🏅' }
};

export default userData;
