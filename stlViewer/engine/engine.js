objCount = 0;

sceneToRendererMap = new Map();
objToDrawAction = new Map();

Engine = { 
	createScene(options) {
		const scene = SceneHandler.createScene(options);
		sceneToRendererMap.set(scene.name, scene);
	},
	addToScene(obj, sceneName, drawActions) {
		SceneHandler.addToScene(obj, sceneName);
		if (drawActions) {
			objToDrawAction.set(obj, {
				askFor: [...drawActions.askFor],
				onDraw: drawActions.onDraw,
			});
		}
	},
	draw() {
		// do some preprocess stuff with callback functions
		doDrawActions();

		const scenes = SceneHandler.getActiveScenes();

		for (const s of scenes) {
			SceneHandler.adjustCamera(s.name);
			RenderHandler.draw(s, s.containerID);
		}
	},
	camera: SceneHandler.camera,
};

function draw(){
	try{
		Engine.draw();
	} catch(e) {
		console.info(e);
	} finally {
		requestAnimationFrame(draw);
	}
}

draw();

function doDrawActions() {
	objToDrawAction.forEach((action) => {
		action.onDraw();
	});
}
