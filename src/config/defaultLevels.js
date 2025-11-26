/**
 * 內建關卡定義
 * parts: 句子段落（比 categories 多 1 個元素）
 * categories: 每個填空對應的卡牌類別
 */
export const DEFAULT_LEVELS = [
    {
        id: 'video',
        parts: ['這個', '真好看'],
        categories: ['video']
    },
    {
        id: 'bus',
        parts: ['', '好像誤點了'],
        categories: ['bus']
    },
    {
        id: 'quality',
        parts: ['這衣服的', '不行'],
        categories: ['quality']
    },
    {
        id: 'morning',
        parts: ['', '，昨晚有睡好嗎？'],
        categories: ['morning']
    },
    {
        id: 'level',
        parts: ['這遊戲的敵人已經夠弱了，你', '是多差才會輸？'],
        categories: ['level']
    },
    {
        id: 'school_mix',
        parts: ['這間學校不是都', '嗎？怎麼道德', '這麼差？'],
        categories: ['honor_student', 'level']
    }
];
