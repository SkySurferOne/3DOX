var absolute = {
    socketio: 'http://127.0.0.1:8081/socket.io/socket.io.js',
    socketio_nc: 'https://cdn.socket.io/socket.io-1.3.4.js'
}

requirejs.config({
    baseUrl: 'js/lib',
	paths: {
        app: '../app',
		class: 'class.min',
		jquery: 'jquery.min',
		three: 'three-r59.min',
		threex_KeyboardState: 'THREEx.KeyboardState',
		threex_DomEvents: 'THREEx.DomEvents',
		threex_DomEventsFix: 'THREEx.DomEvent.Object3D',
		orbitControls: 'THREE.OrbitControls'       
    }
});

// no added class
requirejs(['jquery', 'three', 'threex_KeyboardState', 'stats', 'Detector', 'app/classes/threedox', 'app/tools'], function() {
	requirejs(['app/socket', 'orbitControls', 'threex_DomEvents'], function() {
			requirejs(['app/main'], function() {
				requirejs(['app/gui']);
			});
	});
});

/*
require(['app/modules/engine'], function (engine) {
   //engine.showModule();
   engine.testme();
});
*/