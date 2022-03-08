export const FileLoader = {
	loadSTL(file, onLoad) {
		if (!THREE.STLLoader) {
			console.warn('No STL Loader imported into the project. Canceling load request...');
			return;
		}

		const reader = new FileReader();
		reader.addEventListener('load', (res) => {
			console.log(file);
			const loader = new THREE.STLLoader;
			return loader.load(res.target.result, onLoad);
		});

		reader.readAsDataURL(file);
	},
};
