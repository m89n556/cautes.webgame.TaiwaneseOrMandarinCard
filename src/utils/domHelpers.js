/**
 * DOM 操作工具函數
 */

export const DOMHelpers = {
    /**
     * 獲取元素
     */
    $(id) {
        return document.getElementById(id);
    },

    /**
     * 獲取所有匹配的元素
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * 創建元素
     */
    create(tag, className = '', html = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (html) el.innerHTML = html;
        return el;
    },

    /**
     * 顯示/隱藏元素
     */
    show(el) {
        el.classList.remove('hidden');
    },

    hide(el) {
        el.classList.add('hidden');
    },

    /**
     * 切換 class
     */
    toggleClass(el, className) {
        el.classList.toggle(className);
    },

    /**
     * 添加 class
     */
    addClass(el, className) {
        el.classList.add(className);
    },

    /**
     * 移除 class
     */
    removeClass(el, className) {
        el.classList.remove(className);
    }
};
