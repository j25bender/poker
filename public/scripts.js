const dataInput = document.getElementById('pokerData');

dataInput.addEventListener('change', handleFiles, false);

function handleFiles() {
  const fileList = this.files;
  console.log(fileList)
}
