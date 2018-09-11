var reader = new FileReader();

reader.onload = function(e) {

  var content = reader.result;

    if(window.fileType == "json"){
      app_port_sendModelToElm(content);
    }
    else if(window.fileType == "csv") {
      app_port_sendCsvModelToElm(content);
    }
    else if(window.fileType == "csv2") {
      app_port_sendCsv2ModelToElm(content);
    }

}

function getFileExtension2(filename) {
  return filename.split('.').pop();
}


function loadModelFromFile(loadModelId) {
  var target = document.getElementById(loadModelId);
  var files = target.files; // FileList object
  var file = files[0];

  var extansion = getFileExtension2 (file.name);
  if(extansion == "json")
  {
    window.fileType = "json"
  }
  else if(extansion=="csv")
  {
    window.fileType = "csv"
  }
  else if(extansion=="csv2")
  {
    window.fileType = "csv2"
  }


  reader.readAsText(file);


  }
