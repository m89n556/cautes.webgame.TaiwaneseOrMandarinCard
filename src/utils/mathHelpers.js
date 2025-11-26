/**
 * 數學/邏輯工具函數
 */

export const MathHelpers = {
    /**
     * 隨機排序陣列
     */
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    /**
     * 隨機選擇 n 個元素
     */
    randomPick(array, count) {
        const shuffled = this.shuffle(array);
        return shuffled.slice(0, count);
    },

    /**
     * 線性插值
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * 計算兩點距離
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * 角度轉弧度
     */
    degToRad(deg) {
        return deg * Math.PI / 180;
    },

    /**
     * 弧度轉角度
     */
    radToDeg(rad) {
        return rad * 180 / Math.PI;
    }
};
