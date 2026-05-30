import userData from '../data/userData';

/**
 * Calculates human-readable time remaining for events
 */
function getTimeRemainingText(targetDate) {
  const diffMs = targetDate.getTime() - Date.now();
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
  const diffMs = targetDate.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * The Rule-based Assistant Engine
 */
export function getAssistantSuggestion() {
  const suggestions = [];

  // RULE 1: Event approaching (within next 48 hours)
  userData.joinedEvents.forEach(event => {
    const diffMs = event.date.getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 0 && diffHours <= 48) {
      const timeText = getTimeRemainingText(event.date);
      suggestions.push({
        id: `event-${event.id}`,
        text: `Zbliża się wydarzenie "${event.title}"! Zaczynamy ${timeText} w lokalizacji: ${event.location}. Wybierasz się? 📅`,
        type: 'event',
        weight: 4, // High priority
        actionTab: 'map', // Navigate to Map Page
      });
    }
  });

  // RULE 2: Discount expiring (within next 5 days)
  userData.rewards.forEach(reward => {
    const daysRemaining = getDaysRemaining(reward.validUntil);
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

  // RULE 3: Points threshold progress (points > 60% of next reward)
  const pointsRatio = userData.points / userData.nextRewardThreshold;
  if (pointsRatio >= 0.6) {
    const pointsLeft = userData.nextRewardThreshold - userData.points;
    suggestions.push({
      id: 'points-progress',
      text: `Świetnie Ci idzie! Masz już ${userData.points} punktów. Brakuje Ci tylko ${pointsLeft} pkt do kolejnej super zniżki! Zrób zgłoszenie i zgarnij bonus! 🎁`,
      type: 'points',
      weight: 2, // Medium priority
      actionTab: 'wallet',
    });
  }

  // RULE 4: General Community invitation (default backup)
  suggestions.push({
    id: 'community-check',
    text: `W Twoim sołectwie ${userData.village} jest dzisiaj sporo aktywności! Sprawdź tablicę społeczności, aby zobaczyć inicjatywy sąsiadów! 👥`,
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
