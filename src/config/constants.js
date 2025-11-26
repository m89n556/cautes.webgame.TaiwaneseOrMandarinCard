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

    // UI 相關
    FAN_BASE_Y: 20,
    FAN_RADIUS: 800,
    FAN_ANGLE_SEP: 15,
    AIM_THRESHOLD_OFFSET: 250
};
