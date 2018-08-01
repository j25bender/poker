const dataInput = document.getElementById('pokerData');

dataInput.addEventListener('change', handleFiles, false);

function handleFiles(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const dataString = event.target.result;
    // console.log(dataString)
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
        
      return {player, cards: sortedCards, ...flush, ...straight, ...matchObject}
    })
    return royalCheck(checkHand)
  })
  return results
}

const matchingSuitCheck = (sortedCards, firstCardSuit) => {
  const matchingSuit = sortedCards.filter( card => {
    return card.includes(firstCardSuit)
  })
  return matchingSuit.length === 5 ? {matchingSuit: true} : {matchingSuit: false}
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
  const match = cardArray.filter( (card, i) => {
    if(card === cardArray[i + 1] || card === cardArray[i - 1]) { return card }
  })
  const noMatch = cardArray.filter( card => !match.includes(card))
  const matchObject = { fullHouse: false, 
                        fourOfAKind: false, 
                        twoPair: false, 
                        threeOfAKind: false, 
                        pair: false, 
                        match,
                        noMatch }
  if(match.length === 5) {
    matchObject.fullHouse = true
  } else if (match.length === 4 && match[0] === match[3]) {
    matchObject.fourOfAKind = true
  } else if (match.length === 4 && match[0] != match[3]) {
    matchObject.twoPair = true
  } else if (match.length === 3) {
    matchObject.threeOfAKind = true
  } else if (match.length === 2) {
    matchObject.pair = true
  } else {
    matchObject.highCard = cardArray[4]
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