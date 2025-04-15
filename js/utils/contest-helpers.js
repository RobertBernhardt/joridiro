/**
 * Contest helper functions for the Joridiro application
 */

/**
 * Calculates the progress of a contest
 * @param {Object} contest - Contest data
 * @returns {Object} Progress data
 */
export function calculateContestProgress(contest) {
    const now = new Date();
    const startDate = new Date(contest.startDate);
    const endDate = new Date(contest.endDate);
    
    const result = {
      progressPercentage: 0,
      daysRemaining: 0,
      currentScore: 0,
      targetScore: getTargetScore(contest.size),
      status: ''
    };
    
    // Set current score
    result.currentScore = contest.score || 0;
    
    // Calculate progress based on contest type
    if (contest.type === 'DEADLINE') {
      // If contest hasn't started yet
      if (now < startDate) {
        result.progressPercentage = 0;
        result.status = 'upcoming';
        result.daysRemaining = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      }
      // If contest has ended
      else if (now > endDate) {
        result.progressPercentage = 100;
        result.status = 'ended';
        result.daysRemaining = 0;
      }
      // If contest is ongoing
      else {
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsed = now.getTime() - startDate.getTime();
        result.progressPercentage = Math.min(100, Math.round((elapsed / totalDuration) * 100));
        result.status = 'active';
        result.daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      }
    } else {
      // For SCORE type contests
      result.progressPercentage = Math.min(100, Math.round((result.currentScore / result.targetScore) * 100));
      
      if (result.currentScore >= result.targetScore) {
        result.status = 'completed';
      } else if (!contest.open) {
        result.status = 'ended';
      } else {
        result.status = 'active';
      }
    }
    
    return result;
  }
  
  /**
   * Gets the target score based on contest size
   * @param {string} size - Contest size (SMALL, MEDIUM, LARGE)
   * @returns {number} Target score
   */
  export function getTargetScore(size) {
    switch (size) {
      case 'SMALL':
        return 5;
      case 'MEDIUM':
        return 25;
      case 'LARGE':
        return 100;
      default:
        return 100;
    }
  }
  
  /**
   * Calculates the total score for a participant
   * @param {Object} participant - Participant data
   * @returns {number} Total score
   */
  export function calculateTotalScore(participant) {
    if (!participant || !participant.score) return 0;
    
    return participant.score.reduce((total, item) => {
      return total + (item.points || 0);
    }, 0);
  }
  
  /**
   * Gets the prize amount for a specific contest size
   * @param {string} size - Contest size (SMALL, MEDIUM, LARGE)
   * @returns {Object} Prize data
   */
  export function getPrizeForSize(size) {
    switch (size) {
      case 'SMALL':
        return {
          grandPrize: 250,
          lotteryPrize: 0,
          platformFee: 45
        };
      case 'MEDIUM':
        return {
          grandPrize: 1500,
          lotteryPrize: 222,
          platformFee: 273,
          milestones: [
            {
              points: 5,
              prize: 300
            }
          ]
        };
      case 'LARGE':
        return {
          grandPrize: 5000,
          lotteryPrize: 666,
          platformFee: 829,
          milestones: [
            {
              points: 10,
              prize: 500
            },
            {
              points: 30,
              prize: 1000
            },
            {
              points: 50,
              prize: 1500
            }
          ]
        };
      default:
        return {
          grandPrize: 0,
          lotteryPrize: 0,
          platformFee: 0
        };
    }
  }
  
  /**
   * Gets the duration in days for a specific contest size
   * @param {string} size - Contest size (SMALL, MEDIUM, LARGE)
   * @returns {number} Duration in days
   */
  export function getDurationForSize(size) {
    switch (size) {
      case 'SMALL':
        return 7;
      case 'MEDIUM':
        return 25;
      case 'LARGE':
        return 45;
      default:
        return 30;
    }
  }
  
  /**
   * Checks if a user can join a contest
   * @param {Object} contest - Contest data
   * @param {Object} user - User data
   * @returns {Object} Result with can join status and message
   */
  export function canUserJoinContest(contest, user) {
    if (!user) {
      return {
        canJoin: false,
        message: 'You need to be logged in to join contests'
      };
    }
    
    if (!contest.open) {
      return {
        canJoin: false,
        message: 'This contest is currently closed for new participants'
      };
    }
    
    // Check if user is the organizer
    if (user._id === contest.organizer) {
      return {
        canJoin: false,
        message: 'You cannot join a contest you organized'
      };
    }
    
    // Check if user has already joined
    if (contest.participants?.some(p => p._id === user._id)) {
      return {
        canJoin: false,
        message: 'You have already joined this contest'
      };
    }
    
    // Check dates
    const now = new Date();
    const endDate = new Date(contest.endDate);
    
    if (now > endDate) {
      return {
        canJoin: false,
        message: 'This contest has already ended'
      };
    }
    
    // All checks passed
    return {
      canJoin: true,
      message: ''
    };
  }
  
  /**
   * Checks if a user meets the requirements for a contest
   * @param {Object} contest - Contest data
   * @param {Object} user - User data
   * @returns {boolean} True if the user meets the requirements
   */
  export function userMeetsRequirements(contest, user) {
    if (!user || !contest.requirements) return true;
    
    // Check country requirements
    if (contest.requirements.countries?.length > 0) {
      if (!user.country || !contest.requirements.countries.includes(user.country)) {
        return false;
      }
    }
    
    // Add more requirement checks as needed
    
    return true;
  }