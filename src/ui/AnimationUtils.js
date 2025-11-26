/**
 * 動畫工具函數
 */

export const AnimationUtils = {
    /**
     * 數字動畫
     */
    animateNumber(element, start, end, duration = 500) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (end - start) * progress);
            element.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    },

    /**
     * 顯示浮動訊息
     */
    showFloatingMessage(container, text, colorClass) {
        const el = document.createElement('div');
        el.className = `float-msg ${colorClass}`;
        el.textContent = text;
        container.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    },

    /**
     * 卡牌消失動畫
     */
    vanishCard(cardElement, onComplete) {
        cardElement.classList.add('card-vanish');
        cardElement.addEventListener('animationend', () => {
            cardElement.remove();
            if (onComplete) onComplete();
        }, { once: true });
    }
};
