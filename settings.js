import {COLORS} from "./constants.js";

export const showTop = Number(process.argv[2]) || 20
export const showColors = !!Number(process.argv[3])
export const sortBy = process.argv[4] || 'priceChangePercent' //same as BINANCE_DICT
export const sortOrder = (process.argv[5] || 'dsc') === 'dsc' ? [-1, 1] : [1, -1]

export const showRowsInThatOrder = [ //same as BINANCE_DICT + change and index
  'change',
  'index',
  'symbol',
  'lastPrice',
  'priceChangePercent',
  'weightedAveragePrice',
  'totalTradedBaseAssetVolume',
  'totalTradedQuoteAssetVolume'
]

export const colorMarks = {
  up: COLORS.green,
  down: COLORS.red,
  same: ''
}

export const borderColor = COLORS.blue

export const changeSymbol = {
  up: '🟩 ',
  down: '🟥️ ',
  same: '   '
}

