containerMap = new Map();
camControlMap = new Map();

RenderHandler = {
	draw(s, cID) {
		if (!containerMap.has(cID)) {
			containerMap.set(cID, createNewRenderer(cID));
			const camControl = new THREE.OrbitControls(s.camera, containerMap.get(cID).domElement);
			camControl.screenSpacePanning = true;
			camControlMap.set(cID, camControl);
		}

		const r = containerMap.get(cID);
		const c = $(`#${cID}`);
		r.setSize(c.width(), c.height());

		if (s.picking) {

		} else {
			r.render(s.scene, s.camera);
		}
	}
}

function createNewRenderer(cID) {
	const r = new THREE.WebGLRenderer();
	const c = $(`#${cID}`);
	r.setSize(c.width(), c.height());
	c.append(r.domElement);

	return r;
}
