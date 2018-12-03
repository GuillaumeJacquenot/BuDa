function loadGeometry(loadModelId, id) {
  var target = document.getElementById(loadModelId);
  var files = target.files; // FileList object
  var file = files[0];
  sendGeometry (id, file.name);
}

function sendGeometry(_id,filename) {
  var result = JSON.stringify ( {id: _id, name: "undefined", svg: filename} );
  app_ports_sendGeometryToElm(result);
}
