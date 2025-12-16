/**
 * 輪盤系統
 * 管理輪盤的旋轉、停止和詞語選擇
 */

export class WheelSystem {
    constructor(gameState, dataManager, elements, callbacks) {
        this.state = gameState;
        this.dataManager = dataManager;
        this.els = elements;
        this.callbacks = callbacks;

        // 輪盤狀態
        this.isSpinning = false;
        this.rotation = 0;  // 當前旋轉角度（度）
        this.spinSpeed = 0;  // 旋轉速度（度/幀）
        this.targetRotation = 0;  // 目標旋轉角度
        this.animationFrameId = null;

        // 扇區信息
        this.sectors = [];  // [{cardId, startAngle, endAngle, centerAngle}, ...]
        this.currentPointerCard = null;  // 當前指針指向的詞語
    }

    /**
     * 初始化輪盤扇區
     * @param {Array} cards - 12張詞語卡牌數據
     */
    initWheel(cards) {
        if (!this.els.wheelContainer) {
            console.error('Wheel container not found');
            return;
        }

        this.els.wheelContainer.innerHTML = '';
        this.sectors = [];

        // 確保卡片按支語/台灣交錯排列
        const sortedCards = this.sortCardsAlternating(cards);

        let currentAngle = 0;

        sortedCards.forEach((cardData, index) => {
            // 支語40度，台灣20度
            const sectorSize = cardData.isTW ? 20 : 40;

            // 使用簡化的定位方式：每個扇區是一個絕對定位的標籤
            const sector = document.createElement('div');
            sector.className = 'wheel-sector-label';
            sector.dataset.cardId = cardData.id || `${cardData.category}_${cardData.isTW ? 'tw' : 'cn'}`;

            // 計算標籤位置（圓周上的點）
            const labelAngle = currentAngle + sectorSize / 2;
            const labelRadius = 7; // rem
            const radian = (labelAngle - 90) * Math.PI / 180; // -90度是因為0度在右側，我們要從頂部開始
            const x = Math.cos(radian) * labelRadius;
            const y = Math.sin(radian) * labelRadius;

            sector.style.position = 'absolute';
            sector.style.left = `calc(50% + ${x}rem)`;
            sector.style.top = `calc(50% + ${y}rem)`;
            sector.style.transform = 'translate(-50%, -50%)';
            sector.style.zIndex = '10';

            // 背景顏色
            const bgColor = cardData.isTW
                ? 'rgba(59, 130, 246, 0.8)' // 藍色（台灣）
                : 'rgba(239, 68, 68, 0.8)'; // 紅色（支語）

            sector.style.background = bgColor;
            sector.style.padding = '0.5rem 0.75rem';
            sector.style.borderRadius = '0.5rem';
            sector.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            sector.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';

            sector.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
                    <div style="font-size: 1.5rem;">${cardData.icon}</div>
                    <div style="font-size: 0.65rem; font-weight: bold; color: white; text-align: center; white-space: nowrap;">${cardData.name}</div>
                </div>
            `;

            this.els.wheelContainer.appendChild(sector);

            // 儲存扇區信息
            this.sectors.push({
                cardId: sector.dataset.cardId,
                startAngle: currentAngle,
                endAngle: currentAngle + sectorSize,
                centerAngle: currentAngle + sectorSize / 2
            });

            currentAngle += sectorSize;
        });

        // 初始化指針指向第一個扇區
        this.currentPointerCard = this.sectors[0]?.cardId || null;
    }

    /**
     * 將卡片按支語/台灣交錯排列
     */
    sortCardsAlternating(cards) {
        const cnCards = cards.filter(c => !c.isTW);
        const twCards = cards.filter(c => c.isTW);
        const result = [];

        for (let i = 0; i < Math.max(cnCards.length, twCards.length); i++) {
            if (cnCards[i]) result.push(cnCards[i]);
            if (twCards[i]) result.push(twCards[i]);
        }

        return result;
    }

    /**
     * 切換旋轉狀態（開始/停止）
     */
    toggleSpin() {
        if (!this.isSpinning) {
            // 開始高速旋轉
            this.isSpinning = true;
            this.spinSpeed = 30;  // 初始速度：30度/幀
            this.updateSpin();

            // 更新按鈕狀態
            if (this.els.wheelSpinBtn) {
                this.els.wheelSpinBtn.textContent = '■';
                this.els.wheelSpinBtn.classList.add('spinning');
            }
        } else {
            // 開始減速
            this.isSpinning = false;
            this.startDeceleration();
        }
    }

    /**
     * 更新旋轉動畫（循環）
     */
    updateSpin() {
        if (this.spinSpeed > 0) {
            this.rotation += this.spinSpeed;
            this.rotation %= 360;  // 保持在0-360度範圍內

            // 更新輪盤旋轉
            if (this.els.wheelContainer) {
                this.els.wheelContainer.style.transform = `rotate(${this.rotation}deg)`;
            }

            this.animationFrameId = requestAnimationFrame(() => this.updateSpin());
        } else {
            // 停止動畫
            this.onSpinComplete();
        }
    }

    /**
     * 開始減速
     */
    startDeceleration() {
        const decelerationRate = 0.96;  // 每幀速度衰減率
        const minSpeed = 0.5;  // 最低速度閾值

        const decelerate = () => {
            this.spinSpeed *= decelerationRate;

            if (this.spinSpeed < minSpeed) {
                this.spinSpeed = 0;
                // 對齊到最近的扇區
                this.snapToSector();
            } else {
                this.animationFrameId = requestAnimationFrame(decelerate);
            }
        };

        decelerate();
    }

    /**
     * 對齊到最近的扇區中心
     */
    snapToSector() {
        // 計算最近的扇區
        const selectedCard = this.calculateSelectedWord();
        const selectedSector = this.sectors.find(s => s.cardId === selectedCard);

        if (selectedSector) {
            // 平滑旋轉到扇區中心
            this.smoothRotateTo(360 - selectedSector.centerAngle);
        }
    }

    /**
     * 平滑旋轉到指定角度
     */
    smoothRotateTo(targetAngle) {
        const startAngle = this.rotation;
        const diff = targetAngle - startAngle;

        // 選擇最短旋轉路徑
        let delta = diff;
        if (Math.abs(diff) > 180) {
            delta = diff > 0 ? diff - 360 : diff + 360;
        }

        const endAngle = startAngle + delta;
        const duration = 500;  // 500ms
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 使用緩動函數（easeOutCubic）
            const eased = 1 - Math.pow(1 - progress, 3);

            this.rotation = startAngle + delta * eased;
            if (this.els.wheelContainer) {
                this.els.wheelContainer.style.transform = `rotate(${this.rotation}deg)`;
            }

            if (progress < 1) {
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                this.onSpinComplete();
            }
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * 計算指針指向的詞語
     */
    calculateSelectedWord() {
        // 指針在頂部（0度），考慮輪盤旋轉
        const pointerAngle = (360 - (this.rotation % 360)) % 360;

        // 找到指針對應的扇區
        const selectedSector = this.sectors.find(sector => {
            return pointerAngle >= sector.startAngle && pointerAngle < sector.endAngle;
        });

        return selectedSector ? selectedSector.cardId : this.sectors[0]?.cardId;
    }

    /**
     * 旋轉完成回調
     */
    onSpinComplete() {
        this.spinSpeed = 0;
        this.isSpinning = false;

        // 取消動畫
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // 更新按鈕狀態
        if (this.els.wheelSpinBtn) {
            this.els.wheelSpinBtn.textContent = '▶';
            this.els.wheelSpinBtn.classList.remove('spinning');
        }

        // 計算選中的詞語
        this.currentPointerCard = this.calculateSelectedWord();

        // 調用回調
        if (this.callbacks.onSpinComplete) {
            this.callbacks.onSpinComplete(this.currentPointerCard);
        }

        // 震動回饋（移動端）
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }
    }

    /**
     * 指針左/右移動一個扇區
     * @param {string} direction - 'left' 或 'right'
     */
    movePointer(direction) {
        const currentIndex = this.getCurrentSectorIndex();
        const targetIndex = direction === 'left'
            ? (currentIndex - 1 + this.sectors.length) % this.sectors.length
            : (currentIndex + 1) % this.sectors.length;

        const targetSector = this.sectors[targetIndex];
        this.smoothRotateTo(360 - targetSector.centerAngle);
    }

    /**
     * 獲取當前扇區索引
     */
    getCurrentSectorIndex() {
        const currentCard = this.currentPointerCard;
        return this.sectors.findIndex(s => s.cardId === currentCard);
    }

    /**
     * 獲取當前指針指向的詞語
     */
    getCurrentWord() {
        return this.currentPointerCard;
    }

    /**
     * 重置輪盤狀態（用於「再轉一次」輔助卡）
     */
    resetSpin() {
        this.isSpinning = false;
        this.spinSpeed = 0;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // 允許再次旋轉
        if (this.els.wheelSpinBtn) {
            this.els.wheelSpinBtn.textContent = '▶';
            this.els.wheelSpinBtn.classList.remove('spinning');
        }
    }
}
