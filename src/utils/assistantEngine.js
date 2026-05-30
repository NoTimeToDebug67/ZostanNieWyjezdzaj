import initialUserData from '../data/userData';

/**
 * Calculates human-readable time remaining for events
 */
function getTimeRemainingText(targetDate) {
  // Handle case where targetDate is a string (e.g. if loaded from local DB or serialized state)
  const dateObj = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const diffMs = dateObj.getTime() - Date.now();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  
  if (diffHours <= 1) {
    return 'już za niecałą godzinę';
  } else if (diffHours < 24) {
    return `już za ${diffHours} ${diffHours === 1 ? 'godzinę' : diffHours < 5 ? 'godziny' : 'godzin'}`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `za ${diffDays} ${diffDays === 1 ? 'dzień' : 'dni'}`;
  }
}

/**
 * Calculates human-readable days remaining for discounts
 */
function getDaysRemaining(targetDate) {
  const dateObj = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const diffMs = dateObj.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * The Rule-based Assistant Engine
 * Accepts a dynamic user object. Fallbacks to initialUserData if null.
 */
export function getAssistantSuggestion(user) {
  const activeUser = user || initialUserData;
  const suggestions = [];

  // RULE 1: Event approaching (within next 48 hours)
  if (activeUser.joinedEvents && activeUser.joinedEvents.length > 0) {
    activeUser.joinedEvents.forEach(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      const diffMs = eventDate.getTime() - Date.now();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours > 0 && diffHours <= 48) {
        const timeText = getTimeRemainingText(eventDate);
        suggestions.push({
          id: `event-${event.id}`,
          text: `Zbliża się wydarzenie "${event.title}"! Zaczynamy ${timeText} w lokalizacji: ${event.location}. Wybierasz się? 📅`,
          type: 'event',
          weight: 4, // High priority
          actionTab: 'map', // Navigate to Map Page
        });
      }
    });
  }

  // RULE 2: Discount expiring (within next 5 days)
  if (activeUser.rewards && activeUser.rewards.length > 0) {
    activeUser.rewards.forEach(reward => {
      const expiryDate = reward.validUntil instanceof Date ? reward.validUntil : new Date(reward.validUntil);
      const daysRemaining = getDaysRemaining(expiryDate);
      if (daysRemaining > 0 && daysRemaining <= 5) {
        suggestions.push({
          id: `reward-expire-${reward.id}`,
          text: `Twój rabat ${reward.discount} w "${reward.title}" (${reward.description}) wygasa za ${daysRemaining} ${daysRemaining === 1 ? 'dzień' : 'dni'}! Wykorzystaj go póki czas! 🥐`,
          type: 'reward_expiry',
          weight: 3, // Medium-High priority
          actionTab: 'wallet', // Navigate to Wallet Page
        });
      }
    });
  }

  // RULE 3: Points threshold progress (points > 60% of next reward)
  const pointsRatio = activeUser.points / activeUser.nextRewardThreshold;
  if (pointsRatio >= 0.6) {
    const pointsLeft = activeUser.nextRewardThreshold - activeUser.points;
    suggestions.push({
      id: 'points-progress',
      text: `Świetnie Ci idzie! Masz już ${activeUser.points} punktów. Brakuje Ci tylko ${pointsLeft} pkt do kolejnej super zniżki! Zrób zgłoszenie i zgarnij bonus! 🎁`,
      type: 'points',
      weight: 2, // Medium priority
      actionTab: 'wallet',
    });
  }

  // RULE 4: General Community invitation (default backup)
  suggestions.push({
    id: 'community-check',
    text: `W Twoim sołectwie ${activeUser.village} jest dzisiaj sporo aktywności! Sprawdź tablicę społeczności, aby zobaczyć inicjatywy sąsiadów! 👥`,
    type: 'community',
    weight: 1, // Low priority
    actionTab: 'community',
  });

  // RULE 5: Map Exploration invitation (default backup 2)
  suggestions.push({
    id: 'map-explore',
    text: `Pogoda dziś dopisuje! Odkryj ciekawe miejsca i zabytki w okolicy Tymbarku na naszej interaktywnej mapie! 🗺️`,
    type: 'map',
    weight: 1, // Low priority
    actionTab: 'map',
  });

  // WEIGHTED RANDOM SELECTION
  // Sum up all weights of matching suggestions
  const totalWeight = suggestions.reduce((sum, item) => sum + item.weight, 0);
  
  // Generate a random number between 0 and totalWeight
  let randomVal = Math.random() * totalWeight;

  // Find the selected suggestion
  for (const suggestion of suggestions) {
    randomVal -= suggestion.weight;
    if (randomVal <= 0) {
      return suggestion;
    }
  }

  // Fallback to the first matched one in case of float precision issues
  return suggestions[0];
}
