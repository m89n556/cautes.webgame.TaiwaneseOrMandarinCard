/**
 * 資料管理器
 * 負責載入和合併內建與自訂的卡牌/關卡資料
 */

import { DEFAULT_CARDS } from '../config/defaultCards.js';
import { DEFAULT_LEVELS } from '../config/defaultLevels.js';
import { StorageHelpers } from '../utils/storageHelpers.js';

export class DataManager {
    constructor() {
        this.cards = {};
        this.levels = [];
        this.refresh();
    }

    /**
     * 重新載入所有資料
     */
    refresh() {
        this.cards = this.loadCards();
        this.levels = this.loadLevels();
    }

    /**
     * 載入卡牌（內建 + 自訂）
     */
    loadCards() {
        const customCards = StorageHelpers.getCustomCards();
        return { ...DEFAULT_CARDS, ...customCards };
    }

    /**
     * 載入關卡（內建 + 自訂）
     */
    loadLevels() {
        const customLevels = StorageHelpers.getCustomLevels();
        return [...DEFAULT_LEVELS, ...customLevels];
    }

    /**
     * 獲取所有卡牌
     */
    getAllCards() {
        return this.cards;
    }

    /**
     * 獲取所有關卡
     */
    getAllLevels() {
        return this.levels;
    }

    /**
     * 獲取特定卡牌
     */
    getCard(cardId) {
        return this.cards[cardId];
    }

    /**
     * 獲取支語卡牌
     */
    getCNCards() {
        return Object.keys(this.cards).filter(id => !this.cards[id].isTW);
    }

    /**
     * 獲取台灣卡牌
     */
    getTWCards() {
        return Object.keys(this.cards).filter(id => this.cards[id].isTW);
    }

    /**
     * 新增自訂卡牌
     */
    addCustomCard(id, cardData) {
        const customCards = StorageHelpers.getCustomCards();
        customCards[id] = cardData;
        const success = StorageHelpers.saveCustomCards(customCards);
        if (success) {
            this.refresh();
        }
        return success;
    }

    /**
     * 新增自訂關卡
     */
    addCustomLevel(levelData) {
        const customLevels = StorageHelpers.getCustomLevels();
        customLevels.push(levelData);
        const success = StorageHelpers.saveCustomLevels(customLevels);
        if (success) {
            this.refresh();
        }
        return success;
    }

    /**
     * 清除自訂卡牌
     */
    clearCustomCards() {
        StorageHelpers.clearCustomCards();
        this.refresh();
    }

    /**
     * 清除自訂關卡
     */
    clearCustomLevels() {
        StorageHelpers.clearCustomLevels();
        this.refresh();
    }

    /**
     * 生成類別查詢表（用於開發者模式）
     */
    generateCategoryLookup() {
        const categories = {};
        Object.values(this.cards).forEach(card => {
            if (!categories[card.category]) {
                categories[card.category] = { tw: '', cn: '' };
            }
            if (card.isTW) {
                categories[card.category].tw = card.name;
            } else {
                categories[card.category].cn = card.name;
            }
        });
        return categories;
    }

    /**
     * 檢查是否有足夠的卡牌進行遊戲
     */
    hasEnoughCards() {
        const cnCards = this.getCNCards();
        const twCards = this.getTWCards();
        return cnCards.length >= 4 && twCards.length >= 2;
    }
}
