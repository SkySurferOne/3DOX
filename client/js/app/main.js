/* 3DOX main.js */
console.log("app > main.js ");

// VARIABLES
var basicColor = 0xffffff;
var hoverColor = 0xffff00;
var oColor = 0x0000ff;
var xColor = 0xff0000;
var fogColor = 0x9999ff;

var container, camera, scene, renderer, controls, stats, raycaster, domEvents;
var sphereRadius = 50;
var margin = 20;
var spheres = [];
threedox.spheres = spheres;
threedox.oColor = oColor;
threedox.xColor = xColor;
var keyboard = new THREEx.KeyboardState();

var normalMaterial = new THREE.MeshNormalMaterial( { transparent: true, opacity: 0.9 });
var basicMaterial = new THREE.MeshBasicMaterial( { color: basicColor } );
var transBasicMaterial = new THREE.MeshBasicMaterial( { color: basicColor, transparent: true, opacity: 0.7 } );
var sphereMaterial = new THREE.MeshLambertMaterial( {color: basicColor, transparent: true, opacity: 0.7 } ); 

var mouse = new THREE.Vector2(), INTERSECTED;

// wavy rotation
var sinRotation = true;
var theta = 0;
var rotRadius = 400;
var speed = 0.2;

var currentId = {i: null, j: null, k: null};

showHelpers = false;

//	MAIN
function main() {
	
	// inicjuje zmienne
	init();
	// dodaje modele
	addMeshes();
	// dodaje świalta
	addLights();
	// dodaje pomoce tj. osie
	addHelpers();
	// dodaje eventy
	addEvents();
	// uruchamia pętle
	animate();
	
}
main();

// INIT
function init() {
	// nowa scena
    scene = new THREE.Scene();
	
	// renderer
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	//renderer.setClearColor( 0xffffff, 1);
	
	// szer, wys - renderowania
	renderer.setSize(window.innerWidth, window.innerHeight);
	//document.body.appendChild(renderer.domElement);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	
	// camera - angle of view, aspect ratio, near, far
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20000);
	//camera.position.z = 400;
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.userPan = false;
	//controls.autoRotate = true;
	//controls.autoRotateSpeed = 2.0;
	
	raycaster = new THREE.Raycaster();
	
	domEvents   = new THREEx.DomEvents(camera, renderer.domElement);
	
	threedox.scene = scene;
}

// MESHES
function addMeshes() {
	
	// SPHERES
	var geometry = new THREE.SphereGeometry( sphereRadius, 32, 32 );
	
	for(var i = 0; i < 3; i++) {
		spheres[i] = [];
		for(var j = 0; j < 3; j++) {
			spheres[i][j] = [];
			for(var k = 0; k < 3; k++) {
				var sphere = new THREE.Mesh( geometry.clone(), sphereMaterial.clone() );
				var space = sphereRadius*2+margin;
				var base = -space;
				sphere.position.set(base+k*space, base+i*space, base+j*space);
				spheres[i][j][k] = sphere;
				scene.add( spheres[i][j][k] );
				addSphereEvents(spheres[i][j][k], {i: i, j:j, k:k});
			}
		}
	}
	
	// SKYBOX/FOG
	var imagePrefix = "img/mp_heresy/bloody-heresy_";
	var directions  = ["right", "left", "top", "bottom", "back", "front"];
	var imageSuffix = ".png";
	var skyBoxGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );	
	//var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
	}));
	var skyBoxMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add( skyBox );
	
	// fog must be added to scene before first render
	scene.fog = new THREE.FogExp2( fogColor, 0.00025 );
	
}

// LIGHTS
function addLights() {
	
	/*
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,400,0);
	scene.add(light);
	*/
	
	/*
	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 0, 400, 0 );

	spotLight.castShadow = true;

	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;

	spotLight.shadowCameraNear = 500;
	spotLight.shadowCameraFar = 4000;
	spotLight.shadowCameraFov = 30;

	scene.add( spotLight );
	*/
	
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );

	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );
}

// EVENTS
function addSphereEvents(mesh, id) {

    // resetuje stan mousedown na kuli
    function resetMouseDown() {
        for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++) {
				for(var k = 0; k < 3; k++) {
                    spheres[i][j][k].mousedown = false;
                }
            }
        }
    }
    
	domEvents.addEventListener(mesh, 'click', function(event){
			
            var whoTurn = threedox.getWhoTurn();
            var gamerNumber = threedox.getGamerNumber();
            var gamerSign = threedox.getGamerSign();
            var gameStarted = threedox.getGameStarted();
            var field = threedox.getField();    
        
            if(typeof mesh.mousedown !== 'undefinied' &&  mesh.mousedown === true) {
                console.log('you clicked on the mesh '+ id.i + id.j + id.k);
                if(gameStarted) {
                    if(whoTurn === 'player'+gamerNumber) {
                        if(field.length === 0 || field[id.i][id.j][id.k] === '') {
                    
                            if(gamerSign === 'o')
                                mesh.material.color.setHex( oColor );
                            else if(gamerSign === 'x') 
                                mesh.material.color.setHex( xColor );
                            threedox.fillFieldCell(id.i, id.j, id.k);
                            threedox.changeTurn();
                   
                            /* //gdyby socket okazal się za wolny, a gracz zbyt sprytny
                                block = true;
                                setTimeout(function() { block = false; }, 100);
                            */
                        } else {
                            log('This sphere is filled!', 'info');
                        }
                    } else {
                        log('Not your turn!', 'info');
                    }
                } else {
                    log('Game isn\'t started. Not found second player.', 'info');
                }
            }
            resetMouseDown();
        
	}, false);
	
    domEvents.addEventListener(mesh, 'mouseup', function(event) { 
        //log("mouseup: " + id.i + id.j + id.k, "orange");
        
    }, false);
    
    domEvents.addEventListener(mesh, 'mousedown', function(event) { 
        //log("mousedown: " + id.i + id.j + id.k, "orange");
        mesh.mousedown = true;
        
    }, false);
    
	domEvents.addEventListener(mesh, 'mouseover', function(event){
			//console.log('mouseover on the mesh '+ id.i + id.j + id.k);
            var field = threedox.getField();
        //zabespieczyć
            var str = (field.length > 0)? field[id.i][id.j][id.k] : null;
            
			if(field.length === 0 || (str !== 'o' && str !== 'x' && /n/.test(str) === false)) {
                mesh.currentHex = mesh.material.color.getHex();
                mesh.material.color.setHex( hoverColor );
            }
	}, false);
	
	domEvents.addEventListener(mesh, 'mouseout', function(event){
			//console.log('mouseout on the mesh '+ id.i + id.j + id.k);
			var field = threedox.getField();
            var str = (field.length > 0)? field[id.i][id.j][id.k] : null;
            
            if(field.length === 0 || (str !== 'o' && str !== 'x' && /n/.test(str) === false))
                mesh.material.color.setHex( mesh.currentHex );
			
	}, false);
}

function addEvents() {
	window.addEventListener( 'resize', onWindowResize, false );
	//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//console.log("x: "+mouse.x +", y: "+ mouse.y);
}

// RENDER LOOP
function animate() { 
	requestAnimationFrame(animate); 
	
	render();
	update();
}

// UPDATE
function update()
{
	if ( keyboard.pressed("z") ) 
	{ 
		//console.log('hello!');
	}
	
	controls.update();
    if(typeof stats !== 'undefined' && showHelpers === true)
	   stats.update();
}

// RENDER 
function render() {

	if(sinRotation) {
		theta += speed;

		camera.position.x = rotRadius * Math.sin( THREE.Math.degToRad( theta ) );
		camera.position.y = rotRadius * Math.sin( THREE.Math.degToRad( theta ) );
		camera.position.z = rotRadius * Math.cos( THREE.Math.degToRad( theta ) );
		camera.lookAt( scene.position );

		camera.updateMatrixWorld();
	}
	
	// find intersections
	/*
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children );
	//console.log(intersects.length);
	
	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			INTERSECTED.material.color.setHex( 0xff0000 );

		}

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

	}
	*/
	
	renderer.render(scene, camera); 
}

function addHelpers() {
	if(!showHelpers) return;
	
	// osie
	var material = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});
	
	//y
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3( 0, -1000, 0 ),
		new THREE.Vector3( 0, 1000, 0 )
	);

	var line = new THREE.Line( geometry, material );
	scene.add( line );
	
	//z
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3( 0, 0, -1000 ),
		new THREE.Vector3( 0, 0, 1000 )
	);

	var line = new THREE.Line( geometry, material );
	scene.add( line );
	
	//x
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3( -1000, 0, 0 ),
		new THREE.Vector3( 1000, 0, 0 )
	);

	var line = new THREE.Line( geometry, material );
	scene.add( line );
	
	// axes
	//var axes = new THREE.AxisHelper(100);
	//scene.add( axes );
	
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	
}
//=============================================================
//define(function (require) {
/*tutaj moża lokalnie wczytywać biblioteki*/
	/*var engine = require('app/modules/engine');
	engine.init(function() {
		console.log("ss");
	});
	
	engine.animate(function() {
		console.log("sssdas");
	});*/
	

//});

/*var engine = new Engine();
engine.init();
engine.animate();*/