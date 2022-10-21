import WebSocket from 'ws'

const showTop = Number(process.argv[2]) || 20
const showColors = Number(process.argv[3]) && true

const subTo1hTickerReq = `{
  "method": "SUBSCRIBE",
  "params": ["!ticker_1h@arr"],
  "id": 1
}`

const ws = new WebSocket('wss://stream.binance.com/stream')
  .on('open', () => ws.send(subTo1hTickerReq))
  .on('message', msg => {
    const json = JSON.parse(msg)
    if(json.stream) showListingsTable(json)
  })

const old = {}
const cache = {}
const pads = {
  symbol: 0,
  lastPrice: 0,
  priceChangePercent: 0,
  // openPrice: 0,
  // highPrice: 0,
  // lowPrice: 0,
  weightedAveragePrice: 0,
  totalTradedBaseAssetVolume: 0,
  totalTradedQuoteAssetVolume: 0,
}

const showListingsTable = (json) => {
  const data = json.data.map(translate)
  Object.assign(old, cache)
  for(const quote of data) cache[quote.symbol] = quote

  const quotes = Object.values(cache)
    .sort((a,b) => Number(a.priceChangePercent) > Number(b.priceChangePercent) ? -1 : 1)
  quotes.length = showTop //limit to top X
  updatePaddings(quotes, pads) //using cached paddings just so table not jumps between updates like ебанутая

  const table = quotes
    .map(quote => Object.keys(pads)
      .map(padAndColorize(quote))
      .join(' | '))
    .join('\n')

  console.clear()
  console.log(table)
}

const updatePaddings = (quotes, fields = {symbol: 0, lastPrice: 0, priceChangePercent: 0}) => {
  for(const quote of quotes)
  for(const key of Object.keys(fields)) {
    if(quote?.[key]?.length > fields[key])
      fields[key] = quote[key].length + 1
  }

  return fields
}

const padAndColorize = showColors
? quote => field => {
  const last = old[quote.symbol]?.[field] || ''
  const actual = quote[field]
  const color = last === actual ? ''
    : last > actual ? marks.down
      : marks.up
  return color + String(quote[field]).padEnd(pads[field]) + RESET
}
: quote => field => String(quote[field]).padEnd(pads[field])

const translate = el => Object.fromEntries(Object.keys(dict).map(key => [dict[key], el[key]]))

const dict = {
  "e": 'eventType',
  "E": 'eventTime',
  "s": 'symbol',
  "p": 'priceChange',
  "P": 'priceChangePercent',
  "o": 'openPrice',
  "h": 'highPrice',
  "l": 'lowPrice',
  "c": 'lastPrice',
  "w": 'weightedAveragePrice',
  "v": 'totalTradedBaseAssetVolume',
  "q": 'totalTradedQuoteAssetVolume',
  "O": 'statisticsOpenTime',
  "C": 'statisticsCloseTime',
  "F": 'firstTradeID',
  "L": 'lastTradeID',
  "n": 'totalNumberOfTrades'
}

const RESET = '\x1b[0m'

const COLORS = {
  'black': "\x1b[30m",
  'red': "\x1b[31m",
  'green': "\x1b[32m",
  'yellow': "\x1b[33m",
  'blue': "\x1b[34m",
  'magenta': "\x1b[35m",
  'cyan': "\x1b[36m",
  'white': "\x1b[37m",
}

const marks = {
  up: COLORS.green,
  down: COLORS.red
}