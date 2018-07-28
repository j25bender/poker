const dataInput = document.getElementById('pokerData');

dataInput.addEventListener('change', handleFiles, false);

function handleFiles(event) {
  console.log(event)
  const file = event.target.files[0];
  console.log(file)

  const reader = new FileReader();
  console.log(file)

  reader.onload = function(event) {
    console.log(event.target.result)
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
