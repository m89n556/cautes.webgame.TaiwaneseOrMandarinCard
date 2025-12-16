/**
 * 內建卡牌定義
 * 每張卡牌包含：名稱、圖示、類別、陣營、樣式
 */
export const DEFAULT_CARDS = {
    'video_cn': {
        name: '視頻',
        icon: '📺',
        category: 'video',
        isTW: false,
        colorClass: 'from-gray-100 to-gray-300',
        borderClass: 'border-gray-400',
        iconBg: 'bg-red-100'
    },
    'video_tw': {
        name: '影片',
        icon: '🎬',
        category: 'video',
        isTW: true,
        colorClass: 'from-blue-50 to-blue-200',
        borderClass: 'border-blue-400',
        iconBg: 'bg-blue-100'
    },
    'bus_cn': {
        name: '公交車',
        icon: '🚌',
        category: 'bus',
        isTW: false,
        colorClass: 'from-gray-100 to-gray-300',
        borderClass: 'border-gray-400',
        iconBg: 'bg-red-100'
    },
    'bus_tw': {
        name: '公車',
        icon: '🚍',
        category: 'bus',
        isTW: true,
        colorClass: 'from-green-50 to-green-200',
        borderClass: 'border-green-400',
        iconBg: 'bg-green-100'
    },
    'quality_cn': {
        name: '質量',
        icon: '⚖️',
        category: 'quality',
        isTW: false,
        colorClass: 'from-gray-100 to-gray-300',
        borderClass: 'border-gray-400',
        iconBg: 'bg-red-100'
    },
    'quality_tw': {
        name: '品質',
        icon: '💎',
        category: 'quality',
        isTW: true,
        colorClass: 'from-amber-50 to-amber-200',
        borderClass: 'border-amber-400',
        iconBg: 'bg-amber-100'
    },
    'morning_cn': {
        name: '早上好',
        icon: '🌅',
        category: 'morning',
        isTW: false,
        colorClass: 'from-gray-100 to-gray-300',
        borderClass: 'border-gray-400',
        iconBg: 'bg-red-100'
    },
    'morning_tw': {
        name: '早安',
        icon: '☀️',
        category: 'morning',
        isTW: true,
        colorClass: 'from-orange-50 to-orange-200',
        borderClass: 'border-orange-400',
        iconBg: 'bg-orange-100'
    },
    'level_cn': {
        name: '水平',
        icon: '📊',
        category: 'level',
        isTW: false,
        colorClass: 'from-gray-100 to-gray-300',
        borderClass: 'border-gray-400',
        iconBg: 'bg-red-100'
    },
    'level_tw': {
        name: '水準',
        icon: '📈',
        category: 'level',
        isTW: true,
        colorClass: 'from-cyan-50 to-cyan-200',
        borderClass: 'border-cyan-400',
        iconBg: 'bg-cyan-100'
    },
    'honor_student_cn': {
        name: '學霸',
        icon: '📚',
        category: 'honor_student',
        isTW: false,
        colorClass: 'from-gray-100 to-gray-300',
        borderClass: 'border-gray-400',
        iconBg: 'bg-red-100'
    },
    'honor_student_tw': {
        name: '資優生',
        icon: '🎓',
        category: 'honor_student',
        isTW: true,
        colorClass: 'from-purple-50 to-purple-200',
        borderClass: 'border-purple-400',
        iconBg: 'bg-purple-100'
    },
    'wildcard': {
        name: '萬用牌',
        icon: '🃏',
        category: 'wildcard',
        isTW: null, // 特殊：中立
        colorClass: 'from-yellow-100 to-yellow-300',
        borderClass: 'border-yellow-500',
        iconBg: 'bg-yellow-200'
    }
};
