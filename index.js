import WebSocket from 'ws'

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
  for(const quote of data)
    cache[quote.symbol] = quote

  const quotes = Object.values(cache)
    .sort((a,b) => Number(a.priceChangePercent) > Number(b.priceChangePercent) ? -1 : 1)
  quotes.length = 25 //limit to top 25
  updatePaddings(quotes, pads) //using cached paddings just so table not jumps between updates like ебанутая

  const table = quotes
    .map(quote => Object.keys(pads)
      .map(field => String(quote[field])
        .padEnd(pads[field]))
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