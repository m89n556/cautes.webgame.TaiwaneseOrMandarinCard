/**
 * 輔助卡牌數據定義
 * 用於操控輪盤的工具卡
 */

export const HELPER_CARDS = {
    'spin_again': {
        id: 'spin_again',
        name: '再轉一次',
        icon: '🔄',
        type: 'helper',
        effect: 'spin',
        description: '可以再次轉動輪盤',
        colorClass: 'from-purple-400 to-purple-600',
        borderClass: 'border-purple-400',
        iconBg: 'bg-purple-100'
    },
    'pointer_left': {
        id: 'pointer_left',
        name: '指針左移',
        icon: '⬅️',
        type: 'helper',
        effect: 'move_left',
        description: '將指針向左移動一個扇區',
        colorClass: 'from-indigo-400 to-indigo-600',
        borderClass: 'border-indigo-400',
        iconBg: 'bg-indigo-100'
    },
    'pointer_right': {
        id: 'pointer_right',
        name: '指針右移',
        icon: '➡️',
        type: 'helper',
        effect: 'move_right',
        description: '將指針向右移動一個扇區',
        colorClass: 'from-blue-400 to-blue-600',
        borderClass: 'border-blue-400',
        iconBg: 'bg-blue-100'
    }
};

/**
 * 獲取所有輔助卡ID列表
 */
export function getAllHelperCardIds() {
    return Object.keys(HELPER_CARDS);
}

/**
 * 根據ID獲取輔助卡數據
 */
export function getHelperCard(id) {
    return HELPER_CARDS[id] || null;
}

/**
 * 檢查ID是否為輔助卡
 */
export function isHelperCard(id) {
    return id in HELPER_CARDS;
}
