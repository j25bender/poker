const dataInput = document.getElementById('pokerData');

dataInput.addEventListener('change', handleFiles, false);

function handleFiles(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const dataString = event.target.result;
    cleanData(dataString)
  }

  reader.readAsText(file);
  // await fetch('/api/v1/pokerData', {
  //   method: 'POST',
  //   headers: {'Content-Type': 'application/json'},
  //   body: JSON.stringify({
  //     fileList
  //   })
  // })
}

const cleanData = (data) => {
  const newLinesRemoved = data.replace(/\r?\n|\r/g, ' ').trim()
  const dataArray = newLinesRemoved.split(' ')
  const pokerData = {data:[]}
  let i = 1
  let last = pokerData.data.length

  const cardValueArray = replaceFaceCards(dataArray)
  
  for(i; i <= cardValueArray.length; i++) {
    let playerHand = cardValueArray.slice(i - 1, i + 4)
    if(i % 2 != 0) {
      pokerData.data.push({})
      Object.assign(pokerData.data[last], {'black': playerHand})
    } else {
      Object.assign(pokerData.data[last], {'white': playerHand})
      last = last + 1
    }
    i = i + 4
  }
  evaluateHand(pokerData.data)
}

const replaceFaceCards = (dataArray) => {
  const faceCardValueArray = dataArray.map( card => {
    if(card.includes('J')) {
      const updatedCard = card.replace('J', '11')
      return updatedCard 
    } else if(card.includes('Q')) {
      const updatedCard = card.replace('Q', '12')
      return updatedCard
    } else if(card.includes('K')) {
      const updatedCard = card.replace('K', '13')
      return updatedCard
    } else if(card.includes('A')) {
      const updatedCard = card.replace('A', '14')
      return updatedCard
    } else {
      return card
    }
  })
  return faceCardValueArray;
}

const sortCards = (cards) => {
  const sortedCards = cards.sort( (a, b) => {
    a = a.slice(0, a.length - 1)
    b = b.slice(0, b.length - 1)
    return a - b
  })
  return sortedCards
}

const evaluateHand = (cleanData) => {
  const results = cleanData.map( (round, i) => {
    const playerKeys = Object.keys(round)
    let checkHand = playerKeys.map( player => {
      const firstCard = round[player][0]
      const firstCardSuit = firstCard.slice(firstCard.length - 1)

      const sortedCards = sortCards(round[player])
      const straight = consecutiveValueCheck(sortedCards)
      const flush = matchingSuitCheck(sortedCards, firstCardSuit)
      const matchObject = matchValueCheck(sortedCards)
      const straightFlush = straightFlushCheck(straight, flush)
        
      return {player, cards: sortedCards, ...straightFlush, ...flush, ...straight, ...matchObject}
    })
    return highCardCheck(royalCheck(checkHand))
  })
  return compareCards(results)
}

const highCardCheck = (players) => {
  const black = players[0], white = players[1]
  if(black.noMatch.length && white.noMatch.length) {
    const combineValues = black.noMatch.concat(white.noMatch)
    const allSorted = sortCards(combineValues).reverse()
    const cardArray = allSorted.toString().replace(/[A-Z]/g, '').split(',')
    const findHighest = cardArray.find( (val, i) => val > cardArray[i + 1])

    const blackArray = black.noMatch.toString().replace(/[A-Z]/g, '').split(',')
    const whiteArray = white.noMatch.toString().replace(/[A-Z]/g, '').split(',')
    const tieCheck = blackArray.every((value, index) => value === whiteArray[index])

    if(blackArray.includes(findHighest) && !whiteArray.includes(findHighest)) {
      black['highCard'] = true
      white['highCard'] = false
    } else if (!blackArray.includes(findHighest) && whiteArray.includes(findHighest)) {
      white['highCard'] = true
      black['highCard'] = false
    } else if (tieCheck) {
      white['highCard'] = 'Tie.'
      black['highCard'] = 'Tie.'
    }
  } else {
    white['highCard'] = false
    black['highCard'] = false
  }
  return players
}

const matchingSuitCheck = (sortedCards, firstCardSuit) => {
  const matchingSuit = sortedCards.filter( card => {
    return card.includes(firstCardSuit)
  })
  return matchingSuit.length === 5 ? {flush: true} : {flush: false}
}

const consecutiveValueCheck = (sortedCards) => {
  const aceLowCheck = []
  let straight = sortedCards.map( (card, i) => {
    let prevCard = parseInt(card.slice(0, card.length)) + 1
    let nextCard = i < 4 ? parseInt(sortedCards[i + 1].slice(0, card.length)) :
                           parseInt(sortedCards[i].slice(0, card.length)) + 1
    aceLowCheck.push(prevCard - 1)
    return prevCard === nextCard ? true : false
  })
  return straight = aceLowCheck.toString().includes('2,3,4,5,14') || !straight.includes(false) ? 
                                                            {straight: true} : {straight: false}
}

const matchValueCheck = (sortedCards) => {
  const cardArray = sortedCards.toString().replace(/[A-Z]/g, '').split(',')
  const noMatch = [], matches = []
  const match = cardArray.filter( (card, i) => {
    if(card === cardArray[i + 1] || card === cardArray[i - 1]) {
      matches.push(card)
    } else { noMatch.push(card) }
  })
  const matchTotal = matchTotals(cardArray, match)
  const matchObject = { fullHouse: false, 
                        fourOfAKind: false, 
                        twoPair: false, 
                        threeOfAKind: false, 
                        pair: false, 
                        match: matches,
                        matchTotal,
                        noMatch,
                        badHand: false }
  if(matches.length === 5) {
    matchObject.fullHouse = true
  } else if (matches.length === 4 && matches[0] === matches[3]) {
    matchObject.fourOfAKind = true
  } else if (matches.length === 4 && matches[0] != matches[3]) {
    matchObject.twoPair = true
  } else if (matches.length === 3) {
    matchObject.threeOfAKind = true
  } else if (matches.length === 2) {
    matchObject.pair = true
  } else {
    matchObject.badHand = true
    matchObject.noMatch = sortedCards
  }
  return matchObject
}

const royalCheck = (checkHand) => {
  const confirmRoyal = checkHand.map( (player, i) => {
    const ace = parseInt(player.cards[4].slice(0, player.cards[4].length - 1))
    const highCard = parseInt(player.cards[4].slice(0, player.cards[4].length))
    if(player.straight && player.flush && highCard === ace) {
      return Object.assign(player, {royal: true})
    } else {
      return Object.assign(player, {royal: false})
    }
  })
  return confirmRoyal
}

const straightFlushCheck = (straight, flush) => {
  return straight.straight && flush.flush ? {straightFlush: true} : {straightFlush: false}
}

const matchTotals = (cardArray, match) => {
  const matches = cardArray.reduce( (accu, card) => {
    if(match.includes(card)) {
      accu += parseInt(card)
    }
    return accu
  }, 0)
  return matches
}

const compareCards = (results) => {
  const handRank = ['royal', 'straightFlush', 'fourOfAKind', 'fullHouse',
                    'flush', 'straight', 'threeOfAKind', 'twoPair', 'pair' ]
  const numberOfRounds = Object.keys(results)

  const determineWinner = numberOfRounds.map( (round, i) => {
    const black = results[round][0], white = results[round][1]

    const winningHand = handRank.map( rank => {
      const blackHand = black[rank], whiteHand = white[rank]
      if( blackHand > whiteHand ||
          blackHand === whiteHand && black.matchTotal === white.matchTotal && 
          black.highCard > white.highCard && rank === 'pair' ||
          black.badHand && white.badHand && black.highCard === true && 
          whiteHand === blackHand && rank === 'pair' ||
          blackHand && whiteHand && black.matchTotal > white.matchTotal ) {
        return 'Black wins.'
      } else if ( blackHand < whiteHand ||
                  blackHand === whiteHand && black.matchTotal === white.matchTotal && 
                  black.highCard < white.highCard && rank === 'pair' ||
                  black.badHand && white.badHand && white.highCard === true && 
                  whiteHand === blackHand && rank === 'pair' ||
                  blackHand && whiteHand && black.matchTotal < white.matchTotal ) {
        return 'White wins.'
      } else if ( blackHand === whiteHand &&
                  black.highCard === white.highCard &&
                  black.noMatch === black.noMatch ||
                  black.highCard === 'Tied.' ) {
        return 'Tie.'
      }
    })
    return winningHand
  })
  rankResults(determineWinner)
}

const rankResults = (determineWinner) => {
  const bestHand = determineWinner.reduce( (accu, results, i) => {
    const findWin = results.find( (result, i) => {
      return result != 'Tie.' && result != undefined || i === 8 ? 'Tie.' : null
    })
    return accu += findWin + '\n'
  }, '')
  return bestHand
}