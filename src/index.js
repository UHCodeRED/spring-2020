import {
  Group,
  Mesh,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Clock,
  Color,
  ShaderMaterial,
  MeshPhongMaterial,
  PlaneBufferGeometry
} from "three";

import seed from "seed-random";
import SombreroShader from "./shaders/sombrero.shader";
import TerrainShader from "./shaders/terrain.shader";

seed(Date.now(), { global: true, entropy: true });

function getRandomArbitrary(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function createMultiMaterialObject(geometry, materials) {
  const group = new Group();

  for (let i = 0, l = materials.length; i < l; i++) {
    group.add(new Mesh(geometry, materials[i]));
  }

  return group;
}

function getNetAltitude(options) {
  return (
    Math.abs(options.elevation) +
    Math.abs(options.sombrero_amplitude) +
    Math.abs(options.noise_range)
  );
}

function hasLowVariety(options) {
  if (!options) {
    return false;
  }

  return (
    Math.abs(options.noise_range) < 0.5 &&
    Math.abs(options.sombrero_amplitude) < 0.5
  );
}

function getOptions() {
  const noiseRange = getRandomArbitrary(-3.5, 3.5);
  // const floor = !!Math.round(getRandomArbitrary(0, 1));
  // const floor = Math.abs(noiseRange) >= 1;
  const segments = getRandomArbitrary(100, 200);
  const perlinPasses = 1;
  // const perlinPasses =
  //   segments < 150 ? 1 : Math.round(getRandomArbitrary(1, 2));

  const options = {
    elevation: getRandomArbitrary(-1, 2),
    noise_range: noiseRange,
    sombrero_amplitude: getRandomArbitrary(),
    sombrero_frequency: getRandomArbitrary(10, 20),
    speed: getRandomArbitrary(0.25, 0.35),
    segments,
    wireframe_color: "#888",
    perlin_passes: perlinPasses,
    wireframe: true
    // floor_visible: floor
  };

  if (hasLowVariety(options)) {
    options.floor_visible = hasLowVariety();
  }

  if (getNetAltitude(options) < 1) {
    return getOptions();
  }

  return options;
}

let options = getOptions();

class App {
  constructor() {
    this.canvasGL = null;
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.gui = null;
    this.terrain = null;
    this.composer = null;
    this.render_pass = null;
    this.fxaa_pass = null;
    this.posteffect = false;
    this.meteo = null;
    this.skybox = null;

    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.resize = this.resize.bind(this);

    window.addEventListener("resize", () => {
      this.resize(window.innerWidth, 800);
    });
  }

  init() {
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );

    this.camera.position.z = 7;

    this.camera.position.y = 1;

    this.renderer = new WebGLRenderer({
      width: window.innerWidth,
      height: window.innerHeight,
      scale: 1,
      antialias: false
    });

    this.renderer.setSize(window.innerWidth, 800);

    this.container = document.createElement("div");

    this.container.id = "canvasGL";

    this.container.appendChild(this.renderer.domElement);

    this.camera.lookAt(new Vector3());

    document.getElementById("background").appendChild(this.container);

    this.terrain = new Terrain(this.scene);

    this.scene.add(this.terrain.plane_mesh);

    return this.update();
  }

  update() {
    requestAnimationFrame(this.update);

    this.terrain.update();

    return this.renderScene();
  }

  renderScene() {
    return this.renderer.render(this.scene, this.camera);
  }

  resize(stageWidth, stageHeight) {
    this.camera.aspect = stageWidth / stageHeight;

    this.camera.updateProjectionMatrix();

    return this.renderer.setSize(stageWidth, stageHeight);
  }
}

class Terrain {
  constructor(scene) {
    this.uniforms = null;
    this.plane_mesh = null;
    this.plane_geometry = null;
    this.groundMaterial = null;
    this.clock = new Clock(true);

    this.options = options;
    this.scene = null;

    this.init = this.init.bind(this);
    this.initGUI = this.initGUI.bind(this);
    this.togglePerlin = this.togglePerlin.bind(this);
    this.buildPlanes = this.buildPlanes.bind(this);
    this.update = this.update.bind(this);
    this.scene = scene;

    this.init();
  }

  init() {
    this.uniforms = {
      time: {
        type: "f",
        value: 0.0
      },

      speed: {
        type: "f",
        value: this.options.speed
      },

      elevation: {
        type: "f",
        value: this.options.elevation
      },

      noise_range: {
        type: "f",
        value: this.options.noise_range
      },

      offset: {
        type: "f",
        value: this.options.elevation
      },

      perlin_passes: {
        type: "f",
        value: this.options.perlin_passes
      },

      sombrero_amplitude: {
        type: "f",
        value: this.options.sombrero_amplitude
      },

      sombrero_frequency: {
        type: "f",
        value: this.options.sombrero_frequency
      },

      line_color: {
        type: "c",
        value: new Color(this.options.wireframe_color)
      }
    };

    this.buildPlanes(this.options.segments);

    const logo = document.getElementById("logo");

    logo.addEventListener("dblclick", this.togglePerlin);

    if (process.env.NODE_ENV !== "production") {
      // this.initGUI();
    }
  }

  async initGUI() {
    const dat = await import("dat.gui");
    this.gui = new dat.GUI();

    this.gui.values = {};

    this.gui.values.speed = this.gui
      .add(this.options, "speed", -5, 5)
      .step(0.01);

    this.gui.values.speed.onChange(value => {
      this.uniforms.speed.value = value;
    });

    this.gui.values.segments = this.gui
      .add(this.options, "segments", 20, 800)
      .step(1);

    this.gui.values.segments.onFinishChange(value => {
      this.scene.remove(this.plane_mesh);

      this.buildPlanes(value);

      this.scene.add(this.plane_mesh);
    });

    this.gui.values.perlin_passes = this.gui
      .add(this.options, "perlin_passes", 1, 3)
      .step(1);

    this.gui.values.perlin_passes.onChange(value => {
      this.uniforms.perlin_passes.value = value;
    });

    this.gui.values.elevation = this.gui
      .add(this.options, "elevation", -10, 10)
      .step(0.01);

    this.gui.values.elevation.onChange(value => {
      this.uniforms.elevation.value = value;
    });

    this.gui.values.noise_range = this.gui
      .add(this.options, "noise_range", -10, 10)
      .step(0.01);

    this.gui.values.noise_range.onChange(value => {
      this.uniforms.noise_range.value = value;
    });

    this.gui.values.sombrero_amplitude = this.gui
      .add(this.options, "sombrero_amplitude", -5, 5)
      .step(0.1);

    this.gui.values.sombrero_amplitude.onChange(value => {
      this.uniforms.sombrero_amplitude.value = value;
    });

    this.gui.values.sombrero_frequency = this.gui
      .add(this.options, "sombrero_frequency", 0, 100)
      .step(0.1);

    this.gui.values.sombrero_frequency.onChange(value => {
      this.uniforms.sombrero_frequency.value = value;
    });
  }

  togglePerlin() {
    this.options.perlin_passes = this.options.perlin_passes === 1 ? 2 : 1;
    this.uniforms.perlin_passes = this.options.perlin_passes;
    console.log("toggled perlin passes");
  }

  buildPlanes(segments) {
    this.plane_geometry = new PlaneBufferGeometry(20, 20, segments, segments);

    this.plane_material = new ShaderMaterial({
      vertexShader: SombreroShader,
      fragmentShader: TerrainShader,
      wireframe: true,
      wireframeLinewidth: 1,
      transparent: true,
      uniforms: this.uniforms
    });

    this.groundMaterial = new MeshPhongMaterial({
      // ambient: 0xffffff,
      color: 0xffffff,
      specular: 0x050505
    });

    this.groundMaterial.visible = this.options.floor_visible;

    this.groundMaterial.color.setHSL(0.095, 1, 0.75);

    this.materials = [this.groundMaterial, this.plane_material];

    this.plane_mesh = createMultiMaterialObject(
      this.plane_geometry,
      this.materials
    );

    this.plane_mesh.rotation.x = -Math.PI / 2;

    return (this.plane_mesh.position.y = -0.5);
  }

  update() {
    return (this.plane_material.uniforms[
      "time"
    ].value = this.clock.getElapsedTime());
  }
}

new App().init();
