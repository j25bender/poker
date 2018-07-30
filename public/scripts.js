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

const evaluateHand = (cleanData) => {
  const results = cleanData.map( (round, i) => {
    const playerKeys = Object.keys(round)
    let checkHand = playerKeys.map( player => {
      const firstCard = round[player][0]
      const firstCardSuit = firstCard.slice(firstCard.length - 1)

      const sortedCards = sortCards(round[player])
      const straight = consecutiveValueCheck(sortedCards)

      const numMatchingSuit = sortedCards.filter( card => {
        return card.includes(firstCardSuit)
      })

      if(numMatchingSuit.length === 5) {
        return {player, cards: sortedCards, matchingSuit: true, ...straight}
      } else {
        return {player, cards: sortedCards, matchingSuit: false, ...straight}
      }
    })
    return royalCheck(checkHand)
  })
  return results
}

const sortCards = (cards) => {
  const sortedCards = cards.sort( (a, b) => {
    a = a.slice(0, a.length - 1)
    b = b.slice(0, b.length - 1)
    return a - b
  })
  return sortedCards
}

const consecutiveValueCheck = (sortedCards) => {
  let straight = sortedCards.map( (card, i) => {
    let previousValue = parseInt(card.slice(0, card.length - 1)) + 1
    let nextCardValue = i < 4 ? parseInt(sortedCards[i + 1].slice(0, card.length - 1))                            : parseInt(sortedCards[i].slice(0, card.length - 1)) + 1
    
    if(previousValue === nextCardValue && i <= 4) {
      return true 
    } else {
      return false
    }
  })
  return straight = !straight.includes(false) ? {straight: true} : {straight: false}
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