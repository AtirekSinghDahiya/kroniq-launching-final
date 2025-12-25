import React, { useState, useEffect } from 'react';

interface EmotionalRewardsProps {
    isVisible: boolean;
    onDismiss: () => void;
}

// Subtle reward messages - shown occasionally, not every response
const REWARDS = [
    { emoji: '✨', text: 'Nice question!' },
    { emoji: '🔥', text: 'Trending topic' },
    { emoji: '⚡', text: 'Quick thinking!' },
    { emoji: '💡', text: 'Great insight' },
    { emoji: '🎯', text: 'Right on target' },
];

/**
 * Subtle emotional reward toast
 * Appears occasionally after AI responses to create positive reinforcement
 * Non-intrusive, auto-dismisses
 */
export const EmotionalRewards: React.FC<EmotionalRewardsProps> = ({
    isVisible,
    onDismiss
}) => {
    const [reward, setReward] = useState(REWARDS[0]);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (isVisible) {
            // Pick a random reward
            setReward(REWARDS[Math.floor(Math.random() * REWARDS.length)]);
            setIsExiting(false);

            // Auto-dismiss after 3 seconds
            const timer = setTimeout(() => {
                setIsExiting(true);
                setTimeout(onDismiss, 300);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onDismiss]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 
        px-4 py-2 rounded-full 
        bg-gradient-to-r from-indigo-900/80 to-purple-900/80 
        backdrop-blur-lg border border-white/10
        text-white text-sm font-medium
        flex items-center gap-2
        shadow-lg shadow-indigo-500/20
        ${isExiting ? 'reward-toast-exit' : 'reward-toast'}`}
        >
            <span className="text-base">{reward.emoji}</span>
            <span>{reward.text}</span>
        </div>
    );
};

/**
 * Helper hook to manage reward visibility
 * Shows reward ~20% of the time after AI responses
 */
export const useEmotionalRewards = () => {
    const [showReward, setShowReward] = useState(false);

    const triggerReward = () => {
        // Show reward only 20% of the time for organic feel
        if (Math.random() < 0.2) {
            setShowReward(true);
        }
    };

    const dismissReward = () => {
        setShowReward(false);
    };

    return {
        showReward,
        triggerReward,
        dismissReward
    };
};
