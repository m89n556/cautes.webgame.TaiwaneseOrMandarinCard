/**
 * localStorage 工具函數
 */

export const StorageHelpers = {
    /**
     * 獲取自訂卡牌
     */
    getCustomCards() {
        try {
            const data = localStorage.getItem('custom_cards');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Failed to load custom cards:', e);
            return {};
        }
    },

    /**
     * 儲存自訂卡牌
     */
    saveCustomCards(cards) {
        try {
            localStorage.setItem('custom_cards', JSON.stringify(cards));
            return true;
        } catch (e) {
            console.error('Failed to save custom cards:', e);
            return false;
        }
    },

    /**
     * 獲取自訂關卡
     */
    getCustomLevels() {
        try {
            const data = localStorage.getItem('custom_levels');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load custom levels:', e);
            return [];
        }
    },

    /**
     * 儲存自訂關卡
     */
    saveCustomLevels(levels) {
        try {
            localStorage.setItem('custom_levels', JSON.stringify(levels));
            return true;
        } catch (e) {
            console.error('Failed to save custom levels:', e);
            return false;
        }
    },

    /**
     * 清除自訂卡牌
     */
    clearCustomCards() {
        localStorage.removeItem('custom_cards');
    },

    /**
     * 清除自訂關卡
     */
    clearCustomLevels() {
        localStorage.removeItem('custom_levels');
    }
};
