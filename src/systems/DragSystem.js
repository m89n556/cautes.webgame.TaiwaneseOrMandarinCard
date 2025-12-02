/**
 * 拖曳系統
 * 處理卡牌的拖曳邏輯
 */

export class DragSystem {
    constructor(gameState, elements, callbacks) {
        this.state = gameState;
        this.els = elements;
        this.callbacks = callbacks || {};

        this.init();
    }

    init() {
        // 監聽拖曳事件
        document.addEventListener('mousedown', (e) => this.handleStart(e));
        document.addEventListener('mousemove', (e) => this.handleMove(e));
        document.addEventListener('mouseup', (e) => this.handleEnd(e));
        document.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleEnd(e));
    }

    /**
     * 獲取指標位置（支援滑鼠和觸控）
     */
    getPointerPos(e) {
        if (e.touches) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    /**
     * 開始拖曳
     */
    handleStart(e) {
        if (this.state.isTransitioning) return;

        const card = e.target.closest('.game-card');
        if (!card) return;

        e.preventDefault();

        this.state.draggingCard = card;
        card.classList.add('is-dragging');

        const pos = this.getPointerPos(e);
        const rect = card.getBoundingClientRect();
        this.state.dragOffset.x = pos.x - (rect.left + rect.width / 2);
        this.state.dragOffset.y = pos.y - (rect.top + rect.height / 2);
        card.style.zIndex = 9999;
    }

    /**
     * 拖曳移動
     */
    handleMove(e) {
        if (!this.state.draggingCard) return;

        const pos = this.getPointerPos(e);
        const card = this.state.draggingCard;
        const containerRect = this.els.handContainer.getBoundingClientRect();

        const targetX = pos.x - this.state.dragOffset.x;
        const targetY = pos.y - this.state.dragOffset.y;
        const originX = containerRect.left + containerRect.width / 2;
        const originY = containerRect.bottom - this.state.fanBaseY - card.offsetHeight / 2;

        const relX = targetX - originX;
        const relY = targetY - originY;
        const isAiming = pos.y < this.state.aimThreshold;

        // 優先檢查是否對準目標槽位 (修復拖曳無法施放的 BUG)
        // 即使滑鼠位置低於 aimThreshold，只要對準了槽位也算瞄準
        const hitZone = this.checkTargetCollision(pos.x, pos.y);

        if (isAiming || hitZone) {
            // 瞄準目標區域
            const aimY = this.state.aimThreshold - originY;

            // 如果確實對準了槽位，就不要強制飛到 aimThreshold 高度，而是跟隨滑鼠 (或者保持吸附)
            // 這裡保留原有的 aim 視覺效果，但邏輯上已修正
            card.style.transform = `translate(${relX}px, ${aimY}px) scale(0.8) rotate(0deg)`;
            this.drawArrow(targetX, this.state.aimThreshold, pos.x, pos.y);

            // 萬用牌特殊處理：懸停時觸發選擇預覽
            if (hitZone && card.dataset.id === 'wildcard' && this.callbacks.onWildcardHover) {
                const zone = this.getActiveTargetZone();
                if (zone) {
                    const slotIndex = parseInt(zone.dataset.slotIndex);
                    const zoneRect = zone.getBoundingClientRect();
                    const centerX = zoneRect.left + zoneRect.width / 2;
                    // 判定偏左還是偏右
                    const choice = pos.x < centerX ? 'cn' : 'tw';
                    this.callbacks.onWildcardHover(slotIndex, choice, pos.x, pos.y);
                }
            } else if (this.callbacks.onWildcardHoverEnd) {
                this.callbacks.onWildcardHoverEnd();
            }

            // 清除棄牌/燒牌狀態
            this.els.discardZone.classList.remove('discard-active');
            this.els.burnZone.classList.remove('burn-active');

        } else {
            this.hideArrow();
            // 這裡不需要 resetAllTargetZones，因為 checkTargetCollision 已經處理了 (如果沒撞到會 reset)
            // 但為了保險起見，如果 checkTargetCollision 回傳 false，我們確保重置
            if (!hitZone) {
                this.resetAllTargetZones();
            }
            if (this.callbacks.onWildcardHoverEnd) this.callbacks.onWildcardHoverEnd();

            // 檢查是否拖曳到棄牌堆 (垃圾桶)
            const discardRect = this.els.discardZone.getBoundingClientRect();
            const isOverDiscard = pos.x >= discardRect.left && pos.x <= discardRect.right &&
                pos.y >= discardRect.top && pos.y <= discardRect.bottom;

            // 檢查是否拖曳到燒牌堆 (火坑)
            const burnRect = this.els.burnZone.getBoundingClientRect();
            const isOverBurn = pos.x >= burnRect.left && pos.x <= burnRect.right &&
                pos.y >= burnRect.top && pos.y <= burnRect.bottom;

            if (isOverDiscard) {
                this.els.discardZone.classList.add('discard-active');
                this.els.burnZone.classList.remove('burn-active');
                card.style.transform = `translate(${relX}px, ${relY}px) scale(0.6) rotate(-15deg)`;
            } else if (isOverBurn) {
                this.els.burnZone.classList.add('burn-active');
                this.els.discardZone.classList.remove('discard-active');
                card.style.transform = `translate(${relX}px, ${relY}px) scale(0.6) rotate(15deg)`;
            } else {
                this.els.discardZone.classList.remove('discard-active');
                this.els.burnZone.classList.remove('burn-active');
                card.style.transform = `translate(${relX}px, ${relY}px) rotate(0deg)`;
            }
        }
    }

    /**
     * 結束拖曳
     */
    handleEnd(e) {
        if (!this.state.draggingCard) return;

        const card = this.state.draggingCard;

        // 檢查放置區域
        const targetZone = this.getActiveTargetZone();
        const isDiscarded = this.els.discardZone.classList.contains('discard-active');
        const isBurned = this.els.burnZone.classList.contains('burn-active');

        this.hideArrow();
        this.resetAllTargetZones();
        if (this.callbacks.onWildcardHoverEnd) this.callbacks.onWildcardHoverEnd();

        this.els.discardZone.classList.remove('discard-active');
        this.els.burnZone.classList.remove('burn-active');
        card.classList.remove('is-dragging');
        this.state.draggingCard = null;

        if (targetZone && this.callbacks.onCardPlayed) {
            // 打出卡牌到目標區域
            const slotIndex = parseInt(targetZone.dataset.slotIndex);

            // 萬用牌特殊處理：傳遞選擇
            let extraData = null;
            if (card.dataset.id === 'wildcard') {
                const pos = this.getPointerPos(e);
                const zoneRect = targetZone.getBoundingClientRect();
                const centerX = zoneRect.left + zoneRect.width / 2;
                extraData = { choice: pos.x < centerX ? 'cn' : 'tw' };
            }

            this.callbacks.onCardPlayed(card, slotIndex, extraData);
        } else if (isDiscarded && this.callbacks.onCardDiscarded) {
            // 棄牌 (垃圾桶)
            this.callbacks.onCardDiscarded(card);
        } else if (isBurned && this.callbacks.onCardBurned) {
            // 燒牌 (火坑)
            this.callbacks.onCardBurned(card);
        } else {
            // 放回手牌
            card.style.transform = '';
            if (this.callbacks.onCardReturned) {
                setTimeout(() => this.callbacks.onCardReturned(), 300);
            }
        }
    }

    /**
     * 繪製箭頭
     */
    drawArrow(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2 - dist * 0.3;

        this.els.dragArrow.setAttribute('d', `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);
        const ang = Math.atan2(y2 - cy, x2 - cx) * 180 / Math.PI;
        this.els.arrowHead.setAttribute('transform', `translate(${x2}, ${y2}) rotate(${ang})`);
        this.els.dragArrow.style.opacity = '1';
        this.els.arrowHead.style.opacity = '1';
    }

    /**
     * 隱藏箭頭
     */
    hideArrow() {
        this.els.dragArrow.style.opacity = '0';
        this.els.arrowHead.style.opacity = '0';
    }

    /**
     * 檢查與目標區域的碰撞
     */
    checkTargetCollision(x, y) {
        const zones = document.querySelectorAll('.target-zone');
        let hitAny = false;

        zones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            const hit = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

            if (hit) {
                if (!zone.classList.contains('target-active')) {
                    zone.classList.add('target-active');
                    zone.innerHTML = "放開施放";
                    zone.style.color = "#fbbf24";
                    if (navigator.vibrate) navigator.vibrate(20);
                }
                hitAny = true;
            } else {
                this.resetTargetZone(zone);
            }
        });

        return hitAny;
    }

    /**
     * 重置單一目標區域
     */
    resetTargetZone(zone) {
        zone.classList.remove('target-active');
        zone.innerHTML = "「　」";
        zone.style.color = "";
    }

    /**
     * 重置所有目標區域
     */
    resetAllTargetZones() {
        const zones = document.querySelectorAll('.target-zone');
        zones.forEach(zone => this.resetTargetZone(zone));
    }

    /**
     * 獲取當前激活的目標區域
     */
    getActiveTargetZone() {
        return document.querySelector('.target-zone.target-active');
    }
}
