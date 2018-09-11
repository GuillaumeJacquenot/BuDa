'use strict';

var options = { cyreference : null
								, drawImage : true
								, background : null
								, image_width : 0
								, image_height : 0
								, layoutName : 'dagre'
							};

var dagre_layout = { name: 'dagre' };
var circle_layout = { name: 'circle' };
var spread_layout = { name: 'spread' };
var grid_layout = { name: 'grid'};



var dataElements = {
		nodes: []
		, edges: []
};

var preset_layout_with_bbox = {
  name: 'preset',

  positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
  zoom: undefined, // the zoom level to set (prob want fit = false if set)
  pan: undefined, // the pan level to set (prob want fit = false if set)
  fit: true, // whether to fit to viewport
  padding: 30, // padding on fit
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
	ready: function () {
		_AdjustZoomWithImage ();
  },
  stop: undefined, // callback on layoutstop
  transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts

};

var styleP = $.ajax({
	url: 'mainstyle.css',
	type: 'GET',
	dataType: 'text'
});
var stylesheet = styleP;


function getCyReference() {

	if (options.cyreference == null)
	{
		cy = window.cy = cytoscape({
		  container: document.getElementById('cy')
		  , boxSelectionEnabled: true
		  , autounselectify: false
			, elements : dataElements
			, style: stylesheet
			, layout: dagre
		});
		options.cyreference = cy;
	}

	return options.cyreference;
}


document.addEventListener("DOMContentLoaded", function() {

var cy = getCyReference();

var tappedBefore;
var tappedTimeout;
var mustUpdatepositionstoElm=false;
var hasNodeClicked = false;
var hasNodeMoving = false;


cy.on("click", function(e){
	try {
		var selected = getSelectedEls();
		if(selected.length == 0)
		{
			// console.log('no selection');
			var msg = [];
			_sendSelectionToElm_(msg);

		}
	}
	catch(err){
	// cur_position =
	}
});

cy.on('mousedown', 'node', function(e){
	// console.log('mousedown node event');
	hasNodeClicked=true;
});

cy.on('mouseup', 'node', function(e){
	// console.log('mouseup node event');

	if(hasNodeMoving == true){
		mustUpdatepositionstoElm=true;
	}

	if(mustUpdatepositionstoElm == true){
		// console.log("mustUpdatepositionstoElm to send");
		_setNodesPositionsToElm_();
	}

	hasNodeClicked=false;
	hasNodeMoving=false;
	mustUpdatepositionstoElm=false;

});

cy.on('mousemove', function(e){
	// console.log('mousemove event');

	if(hasNodeClicked==true){
		hasNodeMoving = true;
	}
});


cy.on('tap', function(event) {
  var tappedNow = event.cyTarget;
  if (tappedTimeout && tappedBefore) {
    clearTimeout(tappedTimeout);
  }
  if(tappedBefore === tappedNow) {
    tappedNow.trigger('doubleTap');
    tappedBefore = null;
  } else {
    tappedTimeout = setTimeout(function(){ tappedBefore = null; }, 300);
    tappedBefore = tappedNow;
  }
});

cy.on('doubleTap', 'node', function(event) {

	var selected = getSelectedEls();

	if(selected.length > 0)
	{
		var msg = JSON.stringify ({id: parseInt(selected[0].id())});
		_sendDoubleClickToElm_(msg);
	}


});

cy.on('select', function(event){
		var selected = getSelectedEls();
		if(selected.length > 0)
		{
			var msg = [];
			selected.forEach(function (s)
			{
				msg.push ( JSON.stringify ({id: parseInt(s.id())}) );
			});

			_sendSelectionToElm_(msg);

		}
});


var layer = cy.cyCanvas({
zIndex: -1
//, pixelRatio: 1
});
var canvas = layer.getCanvas();
var ctx = canvas.getContext('2d');
options.canvas = canvas;

cy.on("render cyCanvas.resize", function(evt) {
	_drawImage_ (layer,ctx);
});


}); // end of document.addEventListener


function _drawImage_(layer,ctx) {


		layer.resetTransform(ctx);
		layer.clear(ctx);
		layer.setTransform(ctx);

		if(options.drawImage == true)
		{
			if(options.background != null)
			{
				var canvas = layer.getCanvas();
				var img = options.background;
				ctx.save();
				ctx.drawImage(options.background, 0, 0);
        //ctx.drawImage(img,0,0,img.width,img.height,0,0,cy.width(),cy.height());
				ctx.restore();
			}
		}
}

function _unLoadImage () {
	if(options.background != null)
	{
			delete options.background;
			options.background = null;
	}
}

function _loadImage ( img ) {
	_unLoadImage ();

	var cy = getCyReference();
	var background = new Image();
	background.onload = () => {
		// console.log ("load new image..." );
		// console.log('img:', background.width + ' :: ' + background.height);
		options.image_width = background.width;
		options.image_height = background.height;
		options.image_name = img;
		_layout_preset_with_bbox();
	}

	background.src = img;
	options.background = background;
}

function _AdjustZoomWithImage () {
	var cy = getCyReference();
	var img = options.background;
	if(img != null)
	{
		var img_w = options.image_width;
		var img_h = options.image_height;
		var w = options.canvas.width;
		var h = options.canvas.height;
		// console.log('dimImage:', options.image_width + ' :: ' + options.image_height);
		var newZoom = Math.min ( w / img_w, h/ img_h  );
		//console.log("w/img_w newZoom : " + w + "/" + img_w + " ; " + newZoom);
		cy.viewport({
			zoom: newZoom
			, pan: { x: 0, y: 0 }
		});
	}
}



function _setNodesPositionsToElm_() {
	var cy = getCyReference();
	var ns = cy.nodes();
	var msg = [];

	ns.forEach(function (s)
	{
		var pos = s.position();
			msg.push (
				{ id: parseInt(s.id())
				, position: {x:pos.x, y:pos.y}
				}
			);
	});

	msg = JSON.stringify ( msg );

	// console.log (msg);

	app_port_sendNodesPositionToElm(msg);
}


function _sendSelectionToElm_(msg) {
	app_port_sendSelectionToElm(msg);
}

function _sendDoubleClickToElm_(msg) {
	app_port_sendDoubleClickToElm(msg);
}

function getSelectedNode() {
	var cy = getCyReference();
	return cy.nodes(':selected');
}

function getSelectedEls() {
	var cy = getCyReference();
	return cy.elements(':selected');
}

function setPBSStyle() {
	var cy = getCyReference();
	// cy.setStyle (stylesheetPBS);
}

function setBullesStyle() {
	var cy = getCyReference();
	// cy.setStyle (stylesheetBubble);
}

function _sendDataSimpleModel_ (obj) {
	var cy = getCyReference();
	cy.remove (cy.elements());
	cy.add(obj);
}


function _sendDataModel_ (obj) {
	var cy = getCyReference();
	cy.remove (cy.elements());

	var jsons = [];

	var ns = obj.nodes;
	ns.forEach(function (s)
	{

		jsons.push (
			{
					group: "nodes",
					data: { id: s.data.id, parent: s.data.parent, name: s.data.name, highLighted: s.data.highLighted, blow: s.data.blow, state: s.data.state }
					, position: {x: s.data.position.x, y: s.data.position.y }
			}
		);
	});

	var eds = obj.edges;
	eds.forEach(function (s)
	{
		jsons.push (
			{
			    group: "edges",
			    data: { id: s.data.id, source: s.data.source, target: s.data.target, highLighted: s.data.highLighted, state: s.data.state}
			}
		);

	});

	cy.add(jsons);
}

function _layout_main() {
		if ( options.layoutName == 'circle')
		{
			_layout_circle ();
		}
		else {
			_layout_dagre ();
		}
}

function _layout_dagre () {
	var cy = getCyReference();
	cy.layout(dagre_layout);
}

function _layout_circle () {
	var cy = getCyReference();
	cy.layout(circle_layout);
}

function _layout_preset_with_bbox() {
	var cy = getCyReference();
	cy.layout(preset_layout_with_bbox);
}

function _updateBullesLayoutAndPos(obj) {
	_sendDataSimpleModel_(obj);
	_layout_dagre();
	_setNodesPositionsToElm_();
}

function _saveAsSvg_ (svgName) {
  // demo your core ext
	var cy = getCyReference();
  var svgContent = cy.svgConvertor( {scale : 3, full : true} );
  var svgBlob = new Blob([ svgContent ]
  , { type: 'application/javascript;charset=utf-8' });
  saveAs(svgBlob, svgName + '.svg');
}

function _saveAsPng_ (pngName) {
	var cy = getCyReference();
  var pngContent = cy.png({scale : 3, full : true});
  var b64data = pngContent.substr(pngContent.indexOf(",") + 1);
  var imgBlob = base64ToBlob( b64data, 'image/png' );
  saveAs( imgBlob, pngName + '.png' );
}

function saveToImage (imgName) {
	_saveAsSvg_ (imgName);
	_saveAsPng_ (imgName);
}

function layoutElementsNoPosition() {
	try {
		var cy = getCyReference();
		var collection = cy.nodes("[?blow]");

		if(collection!=null)
		{
			console.log( "collection.size " + collection.size() );

			// add the children of each elt of the collection
			var children = collection.children();
			console.log( "children.size " + children.size() );
			collection = collection.add(children);

			if(collection.size() > 0)
			{
				console.log( "collection.size " + collection.size() );
				collection.layout(dagre_layout);
			}
		}
	}
	catch(err){
		console.log ("err: " + err);
	}
}
