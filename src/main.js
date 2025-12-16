/**
 * 主入口文件
 * 整合所有模組並初始化遊戲
 */

import { GameState } from './core/GameState.js';
import { DataManager } from './core/DataManager.js';
import { DragSystem } from './systems/DragSystem.js';
import { DOMHelpers } from './utils/domHelpers.js';
import { MathHelpers } from './utils/mathHelpers.js';
import { AnimationUtils } from './ui/AnimationUtils.js';
import { GAME_CONFIG } from './config/constants.js';

class Game {
    constructor() {
        this.state = new GameState();
        this.dataManager = new DataManager();
        this.initElements();
        this.initScreens();
        this.initDragSystem();
        this.bindEvents();
    }

    /**
     * 初始化 DOM 元素引用
     */
    initElements() {
        this.els = {
            // Screens
            screens: {
                start: DOMHelpers.$('start-screen'),
                dev: DOMHelpers.$('dev-screen'),
                rules: DOMHelpers.$('rules-screen'),
                draft: DOMHelpers.$('draft-screen'),
                reward: DOMHelpers.$('reward-screen'),
                game: DOMHelpers.$('game-ui')
            },
            // Game UI
            handContainer: DOMHelpers.$('hand-container'),
            questionContainer: DOMHelpers.$('question-container'),
            discardZone: DOMHelpers.$('discard-zone'),
            discardCountBadge: DOMHelpers.$('discard-count-badge'), // New
            burnZone: DOMHelpers.$('burn-zone'), // New
            burnCount: DOMHelpers.$('burn-count'), // New
            burnProgressBar: DOMHelpers.$('burn-progress-bar'), // New
            wildcardOverlay: DOMHelpers.$('wildcard-overlay'), // New
            dragArrow: DOMHelpers.$('drag-arrow'),
            arrowHead: DOMHelpers.$('arrow-head'),
            feedbackContainer: DOMHelpers.$('feedback-container'),
            drawBtn: DOMHelpers.$('draw-btn'),
            drawCount: DOMHelpers.$('draw-count'),
            deckCount: DOMHelpers.$('deck-count'),
            deckList: DOMHelpers.$('deck-list'),
            discardCount: DOMHelpers.$('discard-count'), // Keep for compatibility or remove if unused
            discardList: DOMHelpers.$('discard-list'),
            scoreTW: DOMHelpers.$('score-tw'),
            scoreSC: DOMHelpers.$('score-sc'),
            strikes: [
                DOMHelpers.$('strike-1'),
                DOMHelpers.$('strike-2'),
                DOMHelpers.$('strike-3')
            ],
            // Overlay
            overlay: DOMHelpers.$('overlay'),
            overlayTitle: DOMHelpers.$('overlay-title'),
            overlaySubtitle: DOMHelpers.$('overlay-subtitle'),
            overlayRestart: DOMHelpers.$('overlay-restart-btn'),
            finalStats: DOMHelpers.$('final-stats'),
            finalTw: DOMHelpers.$('final-tw'),
            finalSc: DOMHelpers.$('final-sc'),
            // Draft/Reward
            draftContainer: DOMHelpers.$('draft-container'),
            confirmDraftBtn: DOMHelpers.$('confirm-draft-btn'),
            rewardContainer: DOMHelpers.$('reward-container'),
            // Dev Mode
            devCode: DOMHelpers.$('dev-code'),
            devCardList: DOMHelpers.$('dev-card-list'),
            devLevelList: DOMHelpers.$('dev-level-list'),
            devParts: DOMHelpers.$('dev-parts'),
            devCats: DOMHelpers.$('dev-cats'),
            devCardName: DOMHelpers.$('dev-c-name'),
            devCardIcon: DOMHelpers.$('dev-c-icon'),
            devCardCat: DOMHelpers.$('dev-c-cat'),
            devCardType: DOMHelpers.$('dev-c-type'),
            devCategoryLookup: DOMHelpers.$('dev-category-lookup')
        };
    }

    /**
     * 初始化畫面系統
     */
    initScreens() {
        this.currentScreen = 'start';
    }

    /**
     * 初始化拖曳系統
     */
    initDragSystem() {
        this.dragSystem = new DragSystem(this.state, this.els, {
            onCardPlayed: (card, slotIndex, extraData) => this.playCard(card, slotIndex, extraData),
            onCardDiscarded: (card) => this.discardCard(card),
            onCardBurned: (card) => this.burnCard(card),
            onCardReturned: () => this.updateHandLayout(),
            onWildcardHover: (slotIndex, choice, x, y) => this.onWildcardHover(slotIndex, choice, x, y),
            onWildcardHoverEnd: () => this.onWildcardHoverEnd()
        });
    }

    /**
     * 萬用牌懸停效果
     */
    onWildcardHover(slotIndex, choice, x, y) {
        const currentLevel = this.state.getCurrentLevel();
        const category = currentLevel.categories[slotIndex];

        // 取得對應的支語和台灣牌
        const cnCardId = `${category}_cn`;
        const twCardId = `${category}_tw`;
        const cnData = this.dataManager.getCard(cnCardId);
        const twData = this.dataManager.getCard(twCardId);

        if (!cnData || !twData) return;

        // 顯示 Overlay
        DOMHelpers.removeClass(this.els.wildcardOverlay, 'hidden');

        // 建立或更新左右選項預覽
        // 這裡我們直接用 innerHTML 更新，效能可能稍差但實作簡單
        // 根據 choice 高亮對應邊
        const cnOpacity = choice === 'cn' ? '1' : '0.4';
        const twOpacity = choice === 'tw' ? '1' : '0.4';
        const cnScale = choice === 'cn' ? 'scale(1.1)' : 'scale(0.9)';
        const twScale = choice === 'tw' ? 'scale(1.1)' : 'scale(0.9)';

        // 計算顯示位置：在游標左右兩側
        const gap = GAME_CONFIG.VISUAL.CARD_GAP;
        const cardW = GAME_CONFIG.VISUAL.CARD_WIDTH;
        const cardH = GAME_CONFIG.VISUAL.CARD_HEIGHT;

        this.els.wildcardOverlay.innerHTML = `
            <div class="absolute transition-all duration-200 pointer-events-none flex flex-col items-center" 
                 style="left: ${x - gap - cardW / 2}px; top: ${y - cardH / 2}px; opacity: ${cnOpacity}; transform: ${cnScale}">
                <div class="w-24 h-36 bg-gradient-to-br ${cnData.colorClass} rounded-xl shadow-2xl border-4 ${cnData.borderClass} flex flex-col items-center">
                    <div class="w-full h-20 ${cnData.iconBg} rounded-t-lg flex items-center justify-center text-3xl border-b-2 border-white/20">
                        ${cnData.icon}
                    </div>
                    <div class="flex-grow flex items-center justify-center w-full bg-white rounded-b-lg">
                        <div class="font-bold text-sm text-slate-800">${cnData.name}</div>
                    </div>
                </div>
                <div class="mt-2 text-red-400 font-bold text-shadow">支語</div>
            </div>

            <div class="absolute transition-all duration-200 pointer-events-none flex flex-col items-center" 
                 style="left: ${x + gap - cardW / 2}px; top: ${y - cardH / 2}px; opacity: ${twOpacity}; transform: ${twScale}">
                <div class="w-24 h-36 bg-gradient-to-br ${twData.colorClass} rounded-xl shadow-2xl border-4 ${twData.borderClass} flex flex-col items-center">
                    <div class="w-full h-20 ${twData.iconBg} rounded-t-lg flex items-center justify-center text-3xl border-b-2 border-white/20">
                        ${twData.icon}
                    </div>
                    <div class="flex-grow flex items-center justify-center w-full bg-white rounded-b-lg">
                        <div class="font-bold text-sm text-slate-800">${twData.name}</div>
                    </div>
                </div>
                <div class="mt-2 text-green-400 font-bold text-shadow">台灣</div>
            </div>
        `;
    }

    /**
     * 結束萬用牌懸停
     */
    onWildcardHoverEnd() {
        DOMHelpers.addClass(this.els.wildcardOverlay, 'hidden');
        this.els.wildcardOverlay.innerHTML = '';
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // Start Screen
        DOMHelpers.$('start-game-btn').onclick = () => this.goToDraft();
        DOMHelpers.$('show-rules-btn').onclick = () => this.switchScreen('rules');
        DOMHelpers.$('dev-check-btn').onclick = () => this.checkDevMode();

        // Rules Screen
        DOMHelpers.$('rules-back-btn').onclick = () => this.switchScreen('start');

        // Dev Screen
        DOMHelpers.$('dev-exit-btn').onclick = () => this.switchScreen('start');
        DOMHelpers.$('dev-back-btn').onclick = () => this.switchScreen('start');
        DOMHelpers.$('dev-add-card-btn').onclick = () => this.devAddCard();
        DOMHelpers.$('dev-clear-cards-btn').onclick = () => this.devClearCards();
        DOMHelpers.$('dev-add-level-btn').onclick = () => this.devAddLevel();
        DOMHelpers.$('dev-clear-levels-btn').onclick = () => this.devClearLevels();

        // Draft Screen
        DOMHelpers.$('confirm-draft-btn').onclick = () => {
            // alert("Confirm Draft Clicked!"); // Debug
            this.finishDraft();
        };

        // Game UI
        DOMHelpers.$('restart-btn').onclick = () => this.restart();
        DOMHelpers.$('draw-btn').onclick = () => this.drawCard();
        // overlay-restart-btn 會在 endGame() 中動態綁定

        // Window Resize
        window.addEventListener('resize', () => {
            this.state.aimThreshold = window.innerHeight - GAME_CONFIG.AIM_THRESHOLD_OFFSET;
            this.updateHandLayout();
        });
    }

    /**
     * 切換畫面
     */
    switchScreen(screenName) {
        const target = this.els.screens[screenName];
        Object.values(this.els.screens).forEach(el => {
            if (el !== target) {
                DOMHelpers.removeClass(el, 'active');
                setTimeout(() => {
                    if (!el.classList.contains('active')) {
                        DOMHelpers.addClass(el, 'hidden');
                    }
                }, GAME_CONFIG.VISUAL.ANIMATION_DURATION_NORMAL);
            }
        });
        DOMHelpers.removeClass(target, 'hidden');
        setTimeout(() => DOMHelpers.addClass(target, 'active'), GAME_CONFIG.VISUAL.ANIMATION_DURATION_SHORT / 10); // 20ms -> ~20ms, using short/10 for now or just keep 20 if it's a micro delay. Let's stick to 20 or define a MICRO delay. The plan said 200ms for short. 20ms is very short. Let's keep 20 or add a new constant. The plan didn't specify MICRO. I'll use 20 for now as it's likely a frame delay.
        this.currentScreen = screenName;
    }

    /**
     * 檢查開發者模式
     */
    checkDevMode() {
        if (this.els.devCode.value === GAME_CONFIG.DEV_CODE) {
            this.initDevScreen();
            this.switchScreen('dev');
            this.els.devCode.value = '';
        } else {
            alert('代碼錯誤');
        }
    }

    /**
     * 初始化開發者畫面
     */
    initDevScreen() {
        this.dataManager.refresh();

        // 顯示卡牌列表
        this.els.devCardList.innerHTML = '';
        Object.entries(this.dataManager.getAllCards()).forEach(([id, card]) => {
            const isCustom = !this.dataManager.constructor.name; // 簡化判斷
            const badge = ''; // 可以加上自訂標記
            const div = DOMHelpers.create('div', 'bg-slate-700 p-2 rounded border border-slate-600', `
                <span class="text-lg">${card.icon}</span> ${card.name} ${badge}<br>
                <span class="text-[10px] text-slate-400">${id}</span>
            `);
            this.els.devCardList.appendChild(div);
        });

        // 顯示類別查詢表
        const categories = this.dataManager.generateCategoryLookup();
        let html = '<ul class="space-y-1">';
        Object.entries(categories).forEach(([id, names]) => {
            html += `<li class="flex justify-between border-b border-slate-700 pb-1">
                <span class="font-bold text-yellow-400">${id}</span>
                <span class="text-slate-300">${names.tw} / ${names.cn}</span>
            </li>`;
        });
        html += '</ul>';
        this.els.devCategoryLookup.innerHTML = html;

        this.renderDevLevelList();
    }

    /**
     * 渲染開發者關卡列表
     */
    renderDevLevelList() {
        const levels = this.dataManager.getAllLevels();
        this.els.devLevelList.innerHTML = levels.map((l, i) => {
            return `
            <div class="bg-slate-700 p-2 rounded border border-slate-600 flex justify-between items-center">
                <div>
                    <span class="font-bold text-green-400">Lv${i + 1}</span>
                    ${l.parts.join(' [...] ')}
                </div>
                <div class="text-xs text-slate-400 font-mono">${l.categories.join(', ')}</div>
            </div>`;
        }).join('');
    }

    /**
     * 開發者模式：新增卡牌
     */
    devAddCard() {
        const name = this.els.devCardName.value.trim();
        const icon = this.els.devCardIcon.value.trim();
        const cat = this.els.devCardCat.value.toLowerCase().trim();
        const type = this.els.devCardType.value;

        if (!name || !icon || !cat) {
            alert('請輸入完整卡牌資訊');
            return;
        }

        const isTW = type === 'tw';
        const id = `${cat}_${type}`;

        const newCard = {
            name,
            icon,
            category: cat,
            isTW,
            colorClass: isTW ? 'from-blue-50 to-blue-200' : 'from-gray-100 to-gray-300',
            borderClass: isTW ? 'border-blue-400' : 'border-gray-400',
            iconBg: isTW ? 'bg-blue-100' : 'bg-red-100'
        };

        if (this.dataManager.addCustomCard(id, newCard)) {
            alert(`新增成功！ID: ${id}`);
            this.els.devCardName.value = '';
            this.els.devCardIcon.value = '';
            this.els.devCardCat.value = '';
            this.initDevScreen();
        } else {
            alert('新增失敗！');
        }
    }

    /**
     * 開發者模式：清除自訂卡牌
     */
    devClearCards() {
        if (confirm('確定清除所有自定義卡牌？')) {
            this.dataManager.clearCustomCards();
            this.initDevScreen();
        }
    }

    /**
     * 開發者模式：新增關卡
     */
    devAddLevel() {
        const partsStr = this.els.devParts.value.replace(/｜/g, '|');
        const catsStr = this.els.devCats.value.replace(/｜/g, '|').toLowerCase().trim();

        if (!partsStr || !catsStr) {
            alert('請輸入完整資訊');
            return;
        }

        const parts = partsStr.split('|');
        const categories = catsStr.split('|').map(c => c.trim()).filter(c => c.length > 0);

        if (parts.length !== categories.length + 1) {
            alert(`格式錯誤：題目段落數 (${parts.length}) 必須比類別數 (${categories.length}) 多 1`);
            return;
        }

        const newLevel = {
            id: 'custom_' + Date.now(),
            parts: parts,
            categories: categories
        };

        if (this.dataManager.addCustomLevel(newLevel)) {
            this.els.devParts.value = '';
            this.els.devCats.value = '';
            alert('新增成功！');
            this.initDevScreen();
        } else {
            alert('新增失敗！');
        }
    }

    /**
     * 開發者模式：清除自訂關卡
     */
    devClearLevels() {
        if (confirm('確定清除所有自定義題目？')) {
            this.dataManager.clearCustomLevels();
            this.initDevScreen();
        }
    }

    /**
     * 前往選牌畫面
     */
    goToDraft() {
        this.dataManager.refresh();

        if (!this.dataManager.hasEnoughCards()) {
            alert('錯誤：卡牌數量不足以進行遊戲 (需至少 4 張支語、2 張台灣牌)');
            return;
        }

        const cnCards = this.dataManager.getCNCards();
        const twCards = this.dataManager.getTWCards();

        // Debug: 檢查是否包含萬用卡
        console.log('CN Cards:', cnCards);
        console.log('TW Cards:', twCards);
        console.log('Contains wildcard in CN?', cnCards.includes('wildcard'));
        console.log('Contains wildcard in TW?', twCards.includes('wildcard'));

        this.state.draftOptions = [
            ...MathHelpers.randomPick(cnCards, 4),
            ...MathHelpers.randomPick(twCards, 2)
        ];
        this.state.draftOptions = MathHelpers.shuffle(this.state.draftOptions);

        // Debug: 檢查選項中是否有萬用卡
        console.log('Draft options:', this.state.draftOptions);
        console.log('Contains wildcard in options?', this.state.draftOptions.includes('wildcard'));

        this.renderDraftScreen();
        this.switchScreen('draft');
    }

    /**
     * 渲染選牌畫面
     */
    renderDraftScreen() {
        this.els.draftContainer.innerHTML = '';
        this.els.confirmDraftBtn.textContent = '確認選擇 (0/4)';
        DOMHelpers.addClass(this.els.confirmDraftBtn, 'btn-disabled');
        this.els.confirmDraftBtn.disabled = true;

        this.state.draftOptions.forEach((cardId, index) => {
            const data = this.dataManager.getCard(cardId);
            const cardEl = DOMHelpers.create('div',
                `draft-card w-24 h-40 bg-gradient-to-br ${data.colorClass} rounded-xl shadow-lg border-4 ${data.borderClass} flex flex-col items-center`,
                `
                <div class="w-full h-2/3 ${data.iconBg} rounded-t-lg flex items-center justify-center text-4xl border-b-2 border-white/20 pointer-events-none">
                    ${data.icon}
                </div>
                <div class="flex-grow flex items-center justify-center w-full bg-white rounded-b-lg pointer-events-none">
                    <div class="font-bold text-lg text-slate-800 tracking-widest">${data.name}</div>
                </div>
            `);
            cardEl.onclick = () => this.toggleDraftSelect(index, cardEl);
            this.els.draftContainer.appendChild(cardEl);
        });
    }

    /**
     * 切換選牌選擇
     */
    toggleDraftSelect(index, el) {
        if (el.classList.contains('selected')) {
            DOMHelpers.removeClass(el, 'selected');
        } else {
            const selectedCount = DOMHelpers.$$('.draft-card.selected').length;
            if (selectedCount < 4) {
                DOMHelpers.addClass(el, 'selected');
            }
        }

        const selectedEls = DOMHelpers.$$('.draft-card.selected');
        this.els.confirmDraftBtn.textContent = `確認選擇 (${selectedEls.length}/4)`;

        if (selectedEls.length === 4) {
            DOMHelpers.removeClass(this.els.confirmDraftBtn, 'btn-disabled');
            this.els.confirmDraftBtn.disabled = false;
            // alert("Button Enabled!"); // Debug
        } else {
            DOMHelpers.addClass(this.els.confirmDraftBtn, 'btn-disabled');
            this.els.confirmDraftBtn.disabled = true;
        }
    }

    /**
     * 完成選牌
     */
    finishDraft() {
        try {
            const selectedEls = Array.from(DOMHelpers.$$('.draft-card.selected'));
            const allCardEls = Array.from(this.els.draftContainer.children);
            const selectedCards = selectedEls.map(el => {
                const idx = allCardEls.indexOf(el);
                return this.state.draftOptions[idx];
            });
            this.state.deck = selectedCards;
            this.initGame();
        } catch (e) {
            alert("Error in finishDraft: " + e.message);
            console.error(e);
        }
    }

    /**
     * 初始化遊戲
     */
    initGame() {
        try {
            DOMHelpers.hide(this.els.overlay);

            // 準備關卡順序（按難度排序）
            const allLevels = this.dataManager.getAllLevels();
            const levelsByDiff = {};
            allLevels.forEach(l => {
                const diff = l.categories.length;
                if (!levelsByDiff[diff]) levelsByDiff[diff] = [];
                levelsByDiff[diff].push(l);
            });

            this.state.levelOrder = [];
            Object.keys(levelsByDiff).sort((a, b) => a - b).forEach(diff => {
                const group = MathHelpers.shuffle(levelsByDiff[diff]);
                this.state.levelOrder.push(...group);
            });

            this.state.levelIndex = 0;
            this.state.deck = MathHelpers.shuffle(this.state.deck);
            this.state.hand = [];
            this.state.discardPile = [];
            this.state.drawsLeft = GAME_CONFIG.INITIAL_DRAW_COUNT;
            this.state.burnCount = 0; // 重置燒牌

            this.updateScores();
            this.updateStrikes();
            this.updateDeckUI();
            this.updateDiscardUI();
            this.updateBurnUI(); // New

            this.switchScreen('game');
            this.startLevel();
        } catch (e) {
            alert("Error in initGame: " + e.message);
            console.error(e);
        }
    }

    /**
     * 開始關卡
     */
    startLevel() {
        if (this.state.levelIndex >= this.state.levelOrder.length) {
            this.endGame(true);
            return;
        }

        this.state.isTransitioning = false;
        const currentLevel = this.state.getCurrentLevel();

        this.renderQuestion(currentLevel);
        this.state.initLevelSlots(currentLevel.categories.length);

        this.updateDrawBtn();

        // 手牌回到棄牌堆
        this.state.returnHandToDiscard();

        // 棄牌堆洗回牌庫
        this.state.reshuffleDeck(MathHelpers.shuffle);
        this.updateDiscardUI();

        // 抽初始手牌
        this.state.drawCardsUntil(GAME_CONFIG.INITIAL_HAND_SIZE);
        this.renderHand();
        this.updateDeckUI();
    }

    /**
     * 渲染問題
     */
    renderQuestion(level) {
        this.els.questionContainer.innerHTML = '';

        level.parts.forEach((text, index) => {
            if (text) {
                const span = document.createElement('span');
                span.textContent = text;
                this.els.questionContainer.appendChild(span);
            }

            if (index < level.categories.length) {
                const zone = DOMHelpers.create('div',
                    "target-zone w-28 h-12 md:w-32 md:h-16 border-4 border-dashed border-slate-500/50 rounded-xl flex items-center justify-center transition-all duration-200 bg-black/20 text-slate-400 text-sm mx-1 flex-shrink-0",
                    "「　」"
                );
                zone.dataset.slotIndex = index;
                this.els.questionContainer.appendChild(zone);
            }
        });
    }

    /**
     * 渲染手牌
     */
    renderHand() {
        this.els.handContainer.innerHTML = '';
        this.state.hand.forEach((cardId, index) => {
            const data = this.dataManager.getCard(cardId);
            if (!data) return;
            const el = DOMHelpers.create('div',
                `card game-card w-28 h-44 md:w-36 md:h-52 bg-gradient-to-br ${data.colorClass} rounded-xl shadow-2xl border-4 ${data.borderClass} flex flex-col items-center cursor-grab`,
                `
                <div class="w-full h-32 ${data.iconBg} rounded-t-lg flex items-center justify-center text-5xl border-b-2 border-white/20">
                    ${data.icon}
                </div>
                <div class="flex-grow flex items-center justify-center w-full bg-white rounded-b-lg">
                    <div class="font-black text-2xl text-slate-800 tracking-widest">${data.name}</div>
                </div>
            `);
            el.dataset.id = cardId;
            el.dataset.index = index;
            this.els.handContainer.appendChild(el);
        });
        this.updateHandLayout();
    }

    /**
     * 更新手牌佈局
     */
    updateHandLayout() {
        const cards = Array.from(this.els.handContainer.children);
        if (cards.length === 0) return;
        const total = cards.length;
        const centerIndex = (total - 1) / 2;

        cards.forEach((card, index) => {
            if (this.state.draggingCard === card) return;
            const angle = (index - centerIndex) * this.state.fanAngleSep;
            const yOffset = Math.abs(angle) * 3;
            const xSpread = (index - centerIndex) * GAME_CONFIG.VISUAL.HAND_FAN_SPREAD;

            card.style.left = '50%';
            card.style.bottom = `${this.state.fanBaseY}px`;
            card.style.setProperty('--tx', `calc(-50% + ${xSpread}px)`);
            card.style.setProperty('--ty', `${yOffset}px`);
            card.style.setProperty('--rot', `${angle}deg`);
            card.style.transform = '';
            card.style.zIndex = index + 10;
        });
    }

    /**
     * 打出卡牌
     */
    playCard(cardEl, slotIndex, extraData) {
        const cardId = cardEl.dataset.id;
        const cardData = this.dataManager.getCard(cardId);
        const currentLevel = this.state.getCurrentLevel();
        const targetCategory = currentLevel.categories[slotIndex];

        let msg = "";
        let color = "";
        let isMismatch = false;

        // 萬用牌邏輯
        if (cardId === 'wildcard') {
            const choice = extraData ? extraData.choice : 'tw'; // 預設 TW

            if (choice === 'tw') {
                this.state.updateScores(GAME_CONFIG.SCORE_WILDCARD_TW, 0);
                msg = "勉強接受...";
                color = "text-green-300";
                // 視覺上顯示台灣牌
                const twCardData = this.dataManager.getCard(`${targetCategory}_tw`);
                this.fillSlotVisual(slotIndex, twCardData || cardData);
            } else {
                this.state.updateScores(0, GAME_CONFIG.SCORE_WILDCARD_SC);
                msg = "勉強聽懂...";
                color = "text-red-300";
                // 視覺上顯示支語牌
                const cnCardData = this.dataManager.getCard(`${targetCategory}_cn`);
                this.fillSlotVisual(slotIndex, cnCardData || cardData);
            }

            this.state.fillSlot(slotIndex, cardId);

        } else if (cardData.category === targetCategory) {
            // 正常卡牌邏輯
            if (cardData.isTW) {
                this.state.updateScores(GAME_CONFIG.SCORE_DELTA_CORRECT, -GAME_CONFIG.SCORE_DELTA_CORRECT);
                msg = "台灣價值 UP！";
                color = "text-green-400";
            } else {
                this.state.updateScores(-GAME_CONFIG.SCORE_DELTA_CORRECT, GAME_CONFIG.SCORE_DELTA_CORRECT);
                msg = "社會信用 UP！";
                color = "text-red-500";
            }

            this.state.fillSlot(slotIndex, cardId);
            this.fillSlotVisual(slotIndex, cardData);
        } else {
            // 錯誤邏輯
            isMismatch = true;
            const isGameOver = this.state.addMistake();
            this.updateStrikes();
            msg = `你會不會中文！(醜${this.state.mistakes})`;
            color = "text-yellow-400";

            if (isGameOver) {
                AnimationUtils.showFloatingMessage(this.els.feedbackContainer, msg, color);
                setTimeout(() => this.endGame(false), GAME_CONFIG.VISUAL.ANIMATION_DURATION_LONG);
                return;
            }
        }

        AnimationUtils.showFloatingMessage(this.els.feedbackContainer, msg, color);
        this.updateScores();

        this.state.playCard(cardId);
        this.updateDiscardUI();

        AnimationUtils.vanishCard(cardEl, () => {
            this.updateHandLayout();

            const isAllSlotsFilled = this.state.areAllSlotsFilled();
            const isLevelDone = isMismatch || isAllSlotsFilled;

            if (isLevelDone) {
                if (!this.state.hasNextLevel()) {
                    setTimeout(() => this.endGame(true), GAME_CONFIG.VISUAL.ANIMATION_DURATION_LONG);
                } else {
                    setTimeout(() => this.goToReward(), GAME_CONFIG.VISUAL.ANIMATION_DURATION_LONG);
                }
            } else {
                this.state.drawCardsUntil(GAME_CONFIG.INITIAL_HAND_SIZE);
                this.renderHand();
                this.updateDeckUI();
            }
        });
    }

    /**
     * 填充槽位視覺效果
     */
    fillSlotVisual(slotIndex, cardData) {
        const zones = DOMHelpers.$$('.target-zone');
        const targetZone = Array.from(zones).find(z => parseInt(z.dataset.slotIndex) === slotIndex);

        if (targetZone) {
            DOMHelpers.removeClass(targetZone, 'target-active');
            DOMHelpers.removeClass(targetZone, 'border-dashed');
            DOMHelpers.addClass(targetZone, 'target-filled');
            targetZone.innerHTML = `<span class="text-xl">${cardData.icon}</span>`;
            DOMHelpers.removeClass(targetZone, 'target-zone');
        }
    }

    /**
     * 棄牌 (垃圾桶 - 一換一)
     */
    discardCard(cardEl) {
        const cardId = cardEl.dataset.id;

        // 執行棄牌邏輯
        if (this.state.discardCard(cardId)) {
            // 獲得抽牌機會
            this.state.gainDrawChance();

            AnimationUtils.showFloatingMessage(this.els.feedbackContainer, "棄牌換抽！", "text-indigo-400");

            AnimationUtils.vanishCard(cardEl, () => {
                this.updateDiscardUI();
                this.updateDrawBtn();
                this.updateHandLayout();
            });
        }
    }

    /**
     * 燒牌 (獻祭 - 累積萬用牌)
     */
    burnCard(cardEl) {
        const cardId = cardEl.dataset.id;

        // 執行燒牌邏輯
        const gainedWildcard = this.state.burnCard(cardId);

        AnimationUtils.showFloatingMessage(this.els.feedbackContainer, "燒牌！", "text-orange-500");

        AnimationUtils.vanishCard(cardEl, () => {
            this.updateBurnUI(); // 更新燒牌進度
            this.updateHandLayout();

            // 如果獲得萬用牌
            if (gainedWildcard) {
                AnimationUtils.showFloatingMessage(this.els.feedbackContainer, "獲得萬用牌！", "text-yellow-400");
                this.renderHand(); // 重新渲染手牌以顯示萬用牌
            }
        });
    }

    /**
     * 更新燒牌 UI
     */
    updateBurnUI() {
        const count = this.state.burnCount;
        const max = GAME_CONFIG.BURN_REQUIRED_COUNT;
        const percentage = (count / max) * 100;

        this.els.burnCount.textContent = `${count}/${max}`;
        this.els.burnProgressBar.style.height = `${percentage}%`;
    }

    /**
     * 抽牌
     */
    drawCard() {
        if (this.state.isTransitioning || this.state.drawsLeft <= 0 || this.state.deck.length === 0) return;

        if (this.state.useDrawChance()) {
            this.state.drawCard();
            this.updateDeckUI();
            this.updateDrawBtn();
            this.renderHand();
            AnimationUtils.showFloatingMessage(this.els.feedbackContainer, "抽牌！", "text-white");
        }
    }

    /**
     * 前往獎勵畫面
     */
    goToReward() {
        const cnCards = MathHelpers.randomPick(this.dataManager.getCNCards(), 2);
        const twCards = MathHelpers.randomPick(this.dataManager.getTWCards(), 1);
        const rewardOptions = MathHelpers.shuffle([...cnCards, ...twCards]);

        this.els.rewardContainer.innerHTML = '';
        rewardOptions.forEach(cardId => {
            const data = this.dataManager.getCard(cardId);
            const cardEl = DOMHelpers.create('div',
                `draft-card w-28 h-44 bg-gradient-to-br ${data.colorClass} rounded-xl shadow-lg border-4 ${data.borderClass} flex flex-col items-center hover:scale-105 transition-transform`,
                `
                <div class="w-full h-2/3 ${data.iconBg} rounded-t-lg flex items-center justify-center text-5xl border-b-2 border-white/20 pointer-events-none">
                    ${data.icon}
                </div>
                <div class="flex-grow flex items-center justify-center w-full bg-white rounded-b-lg pointer-events-none">
                    <div class="font-bold text-xl text-slate-800 tracking-widest">${data.name}</div>
                </div>
            `);
            cardEl.onclick = () => this.selectReward(cardId);
            this.els.rewardContainer.appendChild(cardEl);
        });

        this.switchScreen('reward');
    }

    /**
     * 選擇獎勵
     */
    selectReward(cardId) {
        this.state.deck.push(cardId);
        this.updateDeckUI();
        this.switchScreen('game');
        this.nextLevel();
    }

    /**
     * 下一關
     */
    nextLevel() {
        this.state.isTransitioning = true;
        this.state.nextLevel();

        this.els.overlayTitle.textContent = "關卡完成";
        this.els.overlaySubtitle.textContent = "正在前往下一題...";
        DOMHelpers.addClass(this.els.overlayRestart, 'hidden');
        DOMHelpers.addClass(this.els.finalStats, 'hidden');
        DOMHelpers.removeClass(this.els.overlay, 'hidden');

        setTimeout(() => {
            DOMHelpers.addClass(this.els.overlay, 'hidden');
            this.startLevel();
        }, 1200);
    }

    /**
     * 結束遊戲
     */
    endGame(isVictory) {
        DOMHelpers.removeClass(this.els.overlay, 'hidden');
        DOMHelpers.removeClass(this.els.overlayRestart, 'hidden');
        DOMHelpers.removeClass(this.els.finalStats, 'hidden');

        this.els.finalTw.textContent = this.state.scoreTW;
        this.els.finalSc.textContent = this.state.scoreSC;

        if (isVictory) {
            let title = "遊戲結束";
            let subtitle = "你的語言選擇反映了你的生活";

            if (this.state.scoreTW > this.state.scoreSC) {
                title = "文化捍衛者";
                subtitle = "你努力堅守著本土語言的邊界";
            } else if (this.state.scoreSC > this.state.scoreTW) {
                title = "兩岸一家親";
                subtitle = "你擁抱了語言的融合與變遷";
            } else {
                title = "語言觀察家";
                subtitle = "你中立地遊走在兩種語境之間";
            }

            this.els.overlayTitle.textContent = title;
            this.els.overlayTitle.className = "text-4xl md:text-6xl font-bold text-green-400 mb-4";
            this.els.overlaySubtitle.textContent = subtitle;
        } else {
            this.els.overlayTitle.textContent = "遊戲失敗";
            this.els.overlayTitle.className = "text-4xl md:text-6xl font-bold text-red-500 mb-4";
            this.els.overlaySubtitle.textContent = "詞不達意，醜三出局！";
        }

        // 綁定返回主選單按鈕
        this.els.overlayRestart.onclick = () => {
            this.state.reset();
            DOMHelpers.addClass(this.els.overlay, 'hidden');
            this.switchScreen('start');
        };
    }

    /**
     * 重新開始
     */
    restart() {
        if (confirm('重置將回到主選單，確定嗎？')) {
            this.state.reset();
            DOMHelpers.addClass(this.els.overlay, 'hidden');
            this.switchScreen('start');
        }
    }

    /**
     * 更新分數顯示
     */
    updateScores() {
        AnimationUtils.animateNumber(this.els.scoreTW, parseInt(this.els.scoreTW.textContent), this.state.scoreTW);
        AnimationUtils.animateNumber(this.els.scoreSC, parseInt(this.els.scoreSC.textContent), this.state.scoreSC);
    }

    /**
     * 更新錯誤標記
     */
    updateStrikes() {
        this.els.strikes.forEach((el, idx) => {
            if (idx < this.state.mistakes) {
                DOMHelpers.addClass(el, 'active');
            } else {
                DOMHelpers.removeClass(el, 'active');
            }
        });
    }

    /**
     * 更新牌庫 UI
     */
    updateDeckUI() {
        this.els.deckCount.textContent = this.state.deck.length;
        this.els.deckList.innerHTML = '';

        if (this.state.deck.length === 0) {
            this.els.deckList.innerHTML = '<li class="text-slate-500 italic">空空如也...</li>';
            return;
        }

        const counts = {};
        this.state.deck.forEach(id => counts[id] = (counts[id] || 0) + 1);
        Object.keys(counts).forEach(id => {
            const data = this.dataManager.getCard(id);
            if (!data) return;
            const li = DOMHelpers.create('li', 'flex justify-between text-slate-300',
                `<span>${data.icon} ${data.name}</span> <span class="text-indigo-400 font-bold">x${counts[id]}</span>`
            );
            this.els.deckList.appendChild(li);
        });
    }

    /**
     * 更新棄牌堆 UI
     */
    updateDiscardUI() {
        if (this.els.discardCountBadge) {
            this.els.discardCountBadge.textContent = this.state.discardPile.length;
        }
        this.els.discardList.innerHTML = '';

        if (this.state.discardPile.length === 0) {
            this.els.discardList.innerHTML = '<li class="text-slate-500 italic">空空如也...</li>';
            return;
        }

        const counts = {};
        this.state.discardPile.forEach(id => counts[id] = (counts[id] || 0) + 1);
        Object.keys(counts).forEach(id => {
            const data = this.dataManager.getCard(id);
            if (!data) return;
            const li = DOMHelpers.create('li', 'flex justify-between text-slate-300',
                `<span>${data.icon} ${data.name}</span> <span class="text-indigo-400 font-bold">x${counts[id]}</span>`
            );
            this.els.discardList.appendChild(li);
        });
    }

    /**
     * 更新抽牌按鈕
     */
    updateDrawBtn() {
        this.els.drawCount.textContent = `剩餘: ${this.state.drawsLeft}`;
        if (this.state.drawsLeft <= 0 || this.state.deck.length === 0) {
            DOMHelpers.addClass(this.els.drawBtn, 'btn-disabled');
        } else {
            DOMHelpers.removeClass(this.els.drawBtn, 'btn-disabled');
        }
    }
}

// 啟動遊戲
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
