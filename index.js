import WebSocket from 'ws'
import {
  changeSymbol,
  showTop,
  showColors,
  colorMarks,
  sortBy,
  showRowsInThatOrder,
  sortOrder,
  borderColor
} from './settings.js'

import {COLOR_RESET, BINANCE_DICT} from "./constants.js";
const subTo1hTickerMsg = `{
  "method": "SUBSCRIBE",
  "params": ["!ticker_1h@arr"],
  "id": 1
}`

const ws = new WebSocket('wss://stream.binance.com/stream')
  .on('open', () => ws.send(subTo1hTickerMsg))
  .on('message', msg => {
    const json = JSON.parse(msg)
    if(json.stream) showListingsTable(json)
  })

function Store(rows) {
  this.rows = rows
  this.pads = Object.fromEntries(rows.map(e => [e, 0]))
  this.prev = {}
  this.curr = {}

  this.updateData = (newData) => {
    Object.assign(this.prev, this.curr)
    for(const quote of newData) this.curr[quote.symbol] = quote
    return this
  }

  this.updatePads = (quotes) => {
    for(const quote of quotes)
    for(const key of rows)
      if(quote?.[key]?.length > this.pads[key])
        this.pads[key] = quote[key].length + 1
    return this
  }

}

const store = new Store(showRowsInThatOrder)

const setQuoteIndexAndChangeSymbol = oldData => (quote, newPosition) => {
  const oldPosition = oldData[quote.symbol]?.index || '0'
  quote.index = String(newPosition + 1)
  quote.change = oldPosition === quote.index ? changeSymbol.same
    : oldPosition >  quote.index ? changeSymbol.up
    : changeSymbol.down
}

//can sort by ASCII or by Number value ether way should work the same
const sortQuotesBy = (field, posA = -1, posB = 1) => (a, b) => a[field] > b[field] ? posA : posB

const showListingsTable = (json) => {
  const data = json.data.map(translate) //translate a data to human-readable format
  store.updateData(data) //update local storage data
  const sortedQuotes = Object.values(store.curr).sort(sortQuotesBy(sortBy, ...sortOrder)) //sort updated data
  sortedQuotes.forEach(setQuoteIndexAndChangeSymbol(store.prev)) //update indexes and get position change compared to previous index
  sortedQuotes.length = showTop //limit sorted results to top X
  store.updatePads(sortedQuotes) //update paddings for table
  showTable(drawTable(sortedQuotes, store)) //render and show table
}

const drawTable = (quotes, store) => quotes
  .map(quote => store.rows.map(padAndColorize(quote, store)))
  .map(([change, ...other]) => change + other.join(borderColor + ' | ' + COLOR_RESET)) //fixme
  .join('\n')

const showTable = (table) => {
  console.clear()
  console.log(table)
}

const padAndColorize = showColors
? (quote, store) => field => {
  if(field === 'change') return quote[field]
  const last = store.prev[quote.symbol]?.[field] || ''
  const actual = quote[field]
  const color = last === actual ? colorMarks.same
    : last > actual ? colorMarks.down
    : colorMarks.up
  return color + String(quote[field]).padEnd(store.pads[field]) + COLOR_RESET
}
: (quote, store) => field => String(quote[field]).padEnd(store.pads[field])

const translate = el => Object.fromEntries(Object.keys(BINANCE_DICT).map(key => [BINANCE_DICT[key], el[key]]))
