var readImport = new FileReader();

readImport.onload = function(e) {
  var content = readImport.result;

    if(window.fileType == "json"){
      app_port_sendImportModelToElm(content);
    }
    else if(window.fileType == "csv") {
      app_port_sendImportCsvModelToElm(content);
    }
}


function importModelFromFile(loadModelId) {
  var target = document.getElementById("importModel");
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


  readImport.readAsText(file);
  }
