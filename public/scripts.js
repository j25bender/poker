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
  const newLinesRemoved = data.replace(/\r?\n|\r/g, ' ');
  const dataArray = newLinesRemoved.split(' ');
  const pokerData = {data:[]};
  let i = 1
  let last = pokerData.data.length;

  const cardValueArray = replaceFaceCards(dataArray);
  
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
      const updatedCard = card.replace('J', '11');
      return updatedCard 
    } else if(card.includes('Q')) {
      const updatedCard = card.replace('Q', '12');
      return updatedCard
    } else if(card.includes('K')) {
      const updatedCard = card.replace('K', '13');
      return updatedCard
    } else if(card.includes('A')) {
      const updatedCard = card.replace('A', '14');
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
  console.log(sortedCards)
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
  let straight = sortedCards.map( (card, i) => {
    const len = card.length
    let prevCard = parseInt(card.slice(0, len)) + 1
    let nextCard = i < 4 ? parseInt(sortedCards[i + 1].slice(0, len)) : null
                              
    return prevCard === nextCard ? true : false
  })
  return straight = !straight.includes(false) ? {straight: true} : {straight: false}
}

const matchValueCheck = (sortedCards) => {
  const cardArray = sortedCards.toString().replace(/[A-Z]/g, '').split(',')
  const noMatch = []
  const match = cardArray.filter( (card, i) => {
    if(card === cardArray[i + 1] || card === cardArray[i - 1]) {
      return card
    } else { noMatch.push(card) }
  })
  const matchTotal = matchTotals(cardArray, match)
  const matchObject = { fullHouse: false, 
                        fourOfAKind: false, 
                        twoPair: false, 
                        threeOfAKind: false, 
                        pair: false, 
                        match,
                        matchTotal,
                        noMatch: [],
                        badHand: false }
  if(match.length === 5) {
    matchObject.fullHouse = true
  } else if (match.length === 4 && match[0] === match[3]) {
    const q = matchObject.noMatch.push(cardArray.replace(match.toString(), ''))
    matchObject.fourOfAKind = true
  } else if (match.length === 4 && match[0] != match[3]) {
    const q = matchObject.noMatch.push(cardArray.replace(match.toString(), ''))
    matchObject.twoPair = true
  } else if (match.length === 3) {
    const q = matchObject.noMatch.push(cardArray.replace(match.toString(), ''))
    matchObject.threeOfAKind = true
  } else if (match.length === 2) {
    const q = matchObject.noMatch.push(cardArray.replace(match.toString(), ''))
    matchObject.pair = true
  } else {
    matchObject.badHand = true
    matchObject.noMatch = sortedCards
  }
  return matchObject
}

const royalCheck = (checkHand) => {
  const confirmRoyal = checkHand.map( (player, i) => {
    if(player.straight && player.matchingSuit && player.cards[4].includes('14')) {
      return Object.assign(player, {royal: true})
    } else {
      return Object.assign(player, {royal: false})
    }
  })
  return confirmRoyal
}

const straightFlushCheck = (straight, flush) => {
  return straight.straight && flush.matchingSuit ? {straightFlush: true} : {straightFlush: false}
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
  const handRank = ['royal', 'straightFlush', 'fourOfAKind', 'fullHouse', 'flush', 
  'straight', 'threeOfAKind', 'twoPair', 'pair' ]
  console.log(results)
  const numberOfRounds = Object.keys(results)

  const determineWinner = numberOfRounds.map( (round, i) => {
    const black = results[round][0], white = results[round][1]

    const winningHand = handRank.map( i => {
      const blackHand = black[i], whiteHand = white[i]
      if( black.badHand === white.badHand && black.highCard === true ||
          blackHand > whiteHand ||
          blackHand === whiteHand && black.matchTotal > white.matchTotal ||
          blackHand === whiteHand && black.matchTotal === white.matchTotal && black.highCard > white.highCard ) {
        return 'Black wins.'
      } else if ( white.badHand === black.badHand && white.highCard === true ||
                  whiteHand > blackHand ||
                  blackHand === whiteHand && black.matchTotal < white.matchTotal || 
                  blackHand === whiteHand && black.matchTotal === white.matchTotal && black.highCard < white.highCard ||
                  black.straight && white.straight && white.cards[0]) {
        return 'White wins.'
      } else if ( black.highCard === 'Tied.'  ||
                  blackHand === whiteHand &&
                  black.highCard === white.highCard &&
                  black.noMatch === black.noMatch ) {
        return 'Tie.'
      }
    })
    return winningHand
  })
  console.log(determineWinner)
}