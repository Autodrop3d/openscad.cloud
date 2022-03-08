sceneID = 0;

sceneMap = new Map();

activeScenes = new Map();

renderObjQueue = new Map();




SceneHandler = {
	camera: null,
	createScene(options) {
		let container = $(`#${options.containerId}`);

		console.log(this.config);

		const sName = options.name !== undefined ? options.name : `scene-${sceneMap.size}`;
		const bgColor = this.config.backgroundColor;
		const isPickingScene = options.picking !== undefined ? options.picking : false;
		const isActive = options.active !== undefined ? options.active : true;
		const showGrid = options.showGrid;

		// create the threejs scene
		const newScene = new THREE.Scene();
		newScene.name = sName;
		newScene.backgroundColor 

		if (renderObjQueue.has(sName)) {
			newScene.add(...renderObjQueue.get(sName));
			renderObjQueue.delete(sName);
		}

		// create a perspective camera for this scene
		//this.camera = new THREE.PerspectiveCamera(45, container.width() / container.height(), 0.1, 1000);
		//camPerspective = new THREE.OrthographicCamera( container.width() / 2, container.width() / 2,   container.height()/2, container.height()/2 , 0.1, 1000);
		this.camera =  new THREE.OrthographicCamera( container.width() / - 2, container.width() / 2, container.height() / 2, container.height() / - 2, -10000, 150000 );
		
		
		//this.camera = camOrtho;
		this.camera.position.set(
			this.config.defaultCameraPosition.x,
			this.config.defaultCameraPosition.y,
			this.config.defaultCameraPosition.z,
		);


		this.camera.position.set(20, 20, 20);
		this.camera.rotation.order = 'XYZ';


		this.camera.zoom = 3;




		// save this scene to the map of scenes
		sceneMap.set(sName, {
			scene: newScene,
			name: sName,
			camera: this.camera,
			picking: isPickingScene,
			backgroundColor: bgColor,
			activeID: sceneID,
			active: isActive,
			containerID: container.attr('id'),
			showGrid,
		});

		sceneID += 1;

		if (sceneMap.get(sName).active) {
			this.activateScene(sceneMap.get(sName).name);
		}

		if (showGrid) {
			newScene.add(new THREE.GridHelper(100, 1000));
		}
		newScene.add(new THREE.GridHelper(1000, 20));

		return this.getScene(sName);
	},
	getScene(sceneName) {
		return sceneMap.get(sceneName);
	},
	getActiveScenes() {
		return activeScenes.values();
	},
	getAllScenes() {
		return sceneMap.values();
	},
	addToScene(obj, sceneName) {
		const s = this.getScene(sceneName);
		console.log(sceneName);

		if (!s) {

			if (!renderObjQueue.has(sceneName)) {
			 	renderObjQueue.set(sceneName, []);
			}

			renderObjQueue.get(sceneName).push(obj);

			return;
		}

		s.scene.add(obj);
	},
	activateScene(sceneName) {
		const scene = this.getScene(sceneName);

		if (!activeScenes.has(scene.activeID)) {
			activeScenes.set(scene.activeID, scene);
			scene.active = true;
		}
	},
	deactivateScene(sceneName) {
		const scene = this.getScene(sceneName);

		if (activeScenes.has(scene.activeID)) {
			activeScenes.delete(scene.activeID);
			scene.active = false;
		}
	},
	adjustCamera(sceneName){
		const s = sceneMap.get(sceneName);
		const c = $(`#${s.containerID}`);

		s.camera.aspect = c.width() / c.height();
		s.camera.updateProjectionMatrix();
	},
	config: {
		backgroundColor: 0x000000,
		defaultCameraPosition: {
			x: 0,
			y: 10,
			z: 10,
		},
	}
}
