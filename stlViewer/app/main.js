
//import { Engine } from '../../../../../stlViewer/engine/engine.js';

console.log("file imported");
mySuppserGlobalVar = async function getMeThatStlFile(){
	console.log("doing that thing for you");
	
	
	
	const currentSTL =  await doAjax('../api/cadFiles/returnModelStl', {id: openPartID, rev: openPartRev} );
	
	Engine.createScene({ containerId: 'canvas-container', isActive: true, picking: false, showGrid: true });


	alert("Hello");

		
	const loader =  new THREE.STLLoader;
	var geometry = loader.parse(currentSTL);

	const mesh = await new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
	Engine.addToScene(mesh, 'scene-0');
	
}


//mySuppserGlobalVar();

//getMeThatStlFile();


