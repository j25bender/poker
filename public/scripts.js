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
  for(i; i <= dataArray.length; i++) {
    let playerHand = dataArray.slice(i - 1, i + 4)
    if(i % 2 != 0) {
      pokerData.data.push({})
      Object.assign(pokerData.data[last], {'black': playerHand})
    } else {
      Object.assign(pokerData.data[last], {'white': playerHand})
      last = last + 1
    }
    i = i + 4
  }
  console.log(pokerData.data)
  return pokerData.data
}
