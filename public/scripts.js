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
  return pokerData.data
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

