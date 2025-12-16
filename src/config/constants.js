/**
 * 遊戲常數配置
 */
export const GAME_CONFIG = {
    // 初始分數
    INITIAL_TW_SCORE: 50,
    INITIAL_SC_SCORE: 50,

    // 分數變化
    SCORE_DELTA_CORRECT: 10,

    // 錯誤容忍
    MAX_MISTAKES: 3,

    // 抽牌相關
    INITIAL_DRAW_COUNT: 3,
    INITIAL_HAND_SIZE: 3,

    // 選牌階段
    DRAFT_SELECTION_COUNT: 4,
    DRAFT_CN_OPTIONS: 4,
    DRAFT_TW_OPTIONS: 2,

    // 獎勵階段
    REWARD_CN_OPTIONS: 2,
    REWARD_TW_OPTIONS: 1,

    // 開發者模式
    DEV_CODE: '0317',

    // 燒牌交換系統
    BURN_REQUIRED_COUNT: 3,
    SCORE_WILDCARD_TW: 10,
    SCORE_WILDCARD_SC: 10,
    SCORE_WILDCARD_PENALTY_FACTOR: 0.5,

    // 其他
    FAN_BASE_Y: 50,
    FAN_RADIUS: 800,
    FAN_ANGLE_SEP: 15,
    AIM_THRESHOLD_OFFSET: 250,

    // 視覺與動畫配置
    VISUAL: {
        CARD_GAP: 120,
        CARD_WIDTH: 100,
        CARD_HEIGHT: 140,
        ANIMATION_DURATION_SHORT: 200,
        ANIMATION_DURATION_NORMAL: 500,
        ANIMATION_DURATION_LONG: 1000,
        HAND_FAN_SPREAD: 120
    }
};
