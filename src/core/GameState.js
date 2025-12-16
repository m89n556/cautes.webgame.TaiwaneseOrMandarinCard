/**
 * 遊戲狀態管理
 * 集中管理所有遊戲狀態
 */

import { GAME_CONFIG } from '../config/constants.js';

export class GameState {
    constructor() {
        this.reset();
        this.initUIState();
    }

    /**
     * 重置遊戲狀態
     */
    reset() {
        this.phase = 'menu'; // menu, draft, game, reward, gameover
        this.scoreTW = GAME_CONFIG.INITIAL_TW_SCORE;
        this.scoreSC = GAME_CONFIG.INITIAL_SC_SCORE;
        this.mistakes = 0;
        this.levelIndex = 0;
        this.levelOrder = [];
        this.deck = [];  // 保留但用途變更（暫存卡牌ID）
        this.hand = [];  // 混合包含詞語卡和輔助卡
        this.draftOptions = [];  // 暫時保留，後續會移除
        this.levelSlots = [];  // 多填空系統
        this.isTransitioning = false;

        // 輪盤系統相關狀態
        this.wheelSpinsAvailable = 0;  // 可用轉盤次數（暫時未使用，預留）

        // 移除：discardPile, drawsLeft, burnCount（舊系統不再需要）
    }

    /**
     * 初始化 UI 相關狀態
     */
    initUIState() {
        this.draggingCard = null;
        this.dragOffset = { x: 0, y: 0 };
        this.fanBaseY = GAME_CONFIG.FAN_BASE_Y;
        this.fanRadius = GAME_CONFIG.FAN_RADIUS;
        this.fanAngleSep = GAME_CONFIG.FAN_ANGLE_SEP;
        this.aimThreshold = window.innerHeight - GAME_CONFIG.AIM_THRESHOLD_OFFSET;
    }

    /**
     * 更新分數
     */
    updateScores(twDelta, scDelta) {
        this.scoreTW += twDelta;
        this.scoreSC += scDelta;
    }

    /**
     * 增加錯誤次數
     */
    addMistake() {
        this.mistakes++;
        return this.mistakes >= GAME_CONFIG.MAX_MISTAKES;
    }

    /**
     * 初始化關卡槽位
     */
    initLevelSlots(count) {
        this.levelSlots = new Array(count).fill(null);
    }

    /**
     * 填充槽位
     */
    fillSlot(index, cardId) {
        this.levelSlots[index] = cardId;
    }

    /**
     * 檢查所有槽位是否已填滿
     */
    areAllSlotsFilled() {
        return this.levelSlots.every(slot => slot !== null);
    }

    /**
     * 獲取當前關卡
     */
    getCurrentLevel() {
        return this.levelOrder[this.levelIndex];
    }

    /**
     * 是否還有下一關
     */
    hasNextLevel() {
        return this.levelIndex + 1 < this.levelOrder.length;
    }

    /**
     * 前進到下一關
     */
    nextLevel() {
        this.levelIndex++;
    }

    /**
     * 抽一張牌
     */
    drawCard() {
        if (this.deck.length === 0) return null;
        const card = this.deck.pop();
        this.hand.push(card);
        return card;
    }

    /**
     * 抽牌到指定數量
     */
    drawCardsUntil(targetCount) {
        const drawn = [];
        while (this.hand.length < targetCount && this.deck.length > 0) {
            const card = this.drawCard();
            if (card) drawn.push(card);
        }
        return drawn;
    }

    /**
     * 打出一張牌
     */
    playCard(cardId) {
        const index = this.hand.indexOf(cardId);
        if (index === -1) return false;
        this.hand.splice(index, 1);

        // 萬用卡使用後永久消失，不進入棄牌堆
        if (cardId !== 'wildcard') {
            this.discardPile.push(cardId);
        } else {
            console.log('萬用卡已使用，永久消失（不進入棄牌堆）');
        }

        return true;
    }

    /**
     * 棄一張牌 (舊邏輯，現在主要用於燒牌前的過渡或特殊效果)
     */
    discardCard(cardId) {
        const index = this.hand.indexOf(cardId);
        if (index === -1) return false;
        this.hand.splice(index, 1);
        this.discardPile.push(cardId);
        return true;
    }

    /**
     * 燒掉一張牌 (永久移除，累積萬用牌進度)
     * @returns {boolean} 是否觸發萬用牌獎勵
     */
    burnCard(cardId) {
        const index = this.hand.indexOf(cardId);
        if (index === -1) return false;

        // 從手牌移除，且不進入棄牌堆
        this.hand.splice(index, 1);

        // 增加計數
        this.burnCount++;

        // 檢查是否達標
        if (this.burnCount >= GAME_CONFIG.BURN_REQUIRED_COUNT) {
            this.burnCount = 0;
            // 給予萬用牌
            this.hand.push('wildcard');
            return true;
        }

        return false;
    }

    /**
     * 使用抽牌次數
     */
    useDrawChance() {
        if (this.drawsLeft > 0) {
            this.drawsLeft--;
            return true;
        }
        return false;
    }

    /**
     * 增加抽牌次數（透過棄牌/燒牌）
     */
    gainDrawChance() {
        this.drawsLeft++;
    }

    /**
     * 重新洗牌（棄牌堆回牌庫）
     */
    reshuffleDeck(shuffleFn) {
        if (this.discardPile.length === 0) return;
        this.deck.push(...this.discardPile);
        this.discardPile = [];
        this.deck = shuffleFn(this.deck);
    }

    /**
     * 手牌回到棄牌堆
     */
    returnHandToDiscard() {
        // 過濾掉萬用卡，萬用卡不進入棄牌堆（永久消失）
        const wildcardCount = this.hand.filter(cardId => cardId === 'wildcard').length;
        if (wildcardCount > 0) {
            console.log(`關卡結束，手牌中的 ${wildcardCount} 張萬用卡永久消失`);
        }

        const cardsToDiscard = this.hand.filter(cardId => cardId !== 'wildcard');
        this.discardPile.push(...cardsToDiscard);
        this.hand = [];
    }
}
