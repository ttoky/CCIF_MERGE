// Edited by Jihyun
var screenW = window.innerWidth;
var screenH = window.innerHeight;

/**************** default setting ***************/
var container, scene, camera, renderer, raycaster;

/******************** Camera ********************/
var fieldOfView = 75;
var aspectRatio = screenW/screenH;
var nearPlane = 100;
var farPlane = 50000;


var camera_x, camera_y, camera_z;
var screenX =screenW * 0.5;
var screenY =screenH * 0.5;
var mouse = new THREE.Vector2(1, 1);

/***************** External Data(image atlas + position json) *****************/
var atlasNum = 6;
var imgPos = null;
var imgPos_0 = {};
var curPos_0 = {};
var imgPos_1 = {};
var curPos_1 = {};
var imgPos_2 = {};
var curPos_2 = {};
var imgPos_3 = {};
var curPos_3 = {};
var imgPos_4 = {};
var curPos_4 = {};
var imgPos_5 = {};
var curPos_5 = {};

var materials_thumb = {};

var mesh = {};                  // tsne mesh 정보
var curMesh = {};               // Update되는 mesh 정보

var update = false;
var curUpdate = false;

var image = {width: 128, height: 128};
var atlas = {width: 4096, height: 4096, cols: 32, rows: 32};

var targetList = [];

function init() {

    /***************** ENVIROMENT SETTING *******************************************/

    // attach three.js scene to the container
    container = document.getElementById('visualization');
    scene = new THREE.Scene();

    // camera setting
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
    camera.position.z = 5000;
    camera.position.y = -100;

    // renderer setting setting
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);        // Add support for retina displays
    renderer.setSize(screenW, screenH);                     // Specity the size of the canvas
    renderer.setClearColor(0xF00, 1);

    // Add the canvas to the DOM
    container.appendChild(renderer.domElement);   

    // Light setting
    var light = new THREE.PointLight(0xffffff, 1, 0);       // color, intensity, distance
    light.position.set(1, 1, 100);
    scene.add(light);        

    var amlight = new THREE.AmbientLight(0xffffff);
    scene.add(amlight);

    /***************** loading EXTERNAL DATA  *****************************************/

    // load cluster position json
    var loader = new THREE.FileLoader();
        loader.load('data/128px_tSNE-image_square_normalized.json', function(data) {
        imgPos = JSON.parse(data);
        loadJson(imgPos);   
    })

    // Load the external texture  materials
    var loader = new THREE.TextureLoader();
    for(var i=0; i<atlasNum; i++) {
        var url = 'data/128px-4096-img-atlas/4096-img-atlas-0' + i + '.jpg';
        loader.load(url, handleTexture.bind(null, i));
    }

    /***************** ratcaster  *****************************************/
    // raycaster = new THREE.Raycaster();
    // mouse = new THREE.Vector2();
    // projector = new THREE.Projector();

    /*************** window event listerner  *****************************/
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousedown', mouse_position, false);

}//<--------- the end of initializing function 
/****************************************************************/

//-----------Begging of maetirals & gemometry

function loadJson(imagePos) {
    for(var i=0; i<1024; i++) {
        imgPos_0[i] = imagePos[i];
        curPos_0[i] = imagePos[i];
    }

    for(var i=1024; i<2048; i++) {
        imgPos_1[i] = imagePos[i];
        curPos_1[i] = imagePos[i];
    }

    for(var i=2048; i<3072; i++) {
        imgPos_2[i] = imagePos[i];
        curPos_2[i] = imagePos[i];
    }

    for(var i=3072; i<4096; i++) {
        imgPos_3[i] = imagePos[i];
        curPos_3[i] = imagePos[i];
    }

    for(var i=4096; i<5120; i++) {
        imgPos_4[i] = imagePos[i];
        curPos_4[i] = imagePos[i];
    }

    for(var i=5120; i<6144; i++) {
        imgPos_5[i] = imagePos[i];
        curPos_5[i] = imagePos[i];
    }
}

function handleTexture(idx, texture) {
    materials_thumb[idx] = new THREE.MeshBasicMaterial({ map: texture });
    conditionallyBuildGeometries();
}

function conditionallyBuildGeometries() {
    if(Object.keys(materials_thumb).length === atlasNum) {
        // load images texture
        document.querySelector('#loading').style.display = 'none';
        buildGeometry();
        updateGeometry();
    }
}

// build geometry & materials ONLY CONTAINING tSNE position DATA W/O TEXTURE ------------------>>>
function buildGeometry() {
    for(var i=0; i<atlasNum; i++) {
        // Create one new geometry per atlas
        var geometry = new THREE.Geometry();

        for(var j=0; j<atlas.cols*atlas.rows; j++) {
            var coords = getCoords(i, j);
            geometry = updateVertices(geometry, coords)
            geometry = updateFaces(geometry)
            
            // mesh without Texture
            var material = new THREE.MeshBasicMaterial({color:0xff0000});
        }
        buildMesh(geometry, material, i);
    }
}

// Updating of build image geometry & materials  WITH TEXTURE  ------------------>>>
function updateGeometry() {
    for(var i=0; i<atlasNum; i++) {
        // Create one new geometry per atlas
        var updateGeo = new THREE.Geometry();

        for(var j=0; j<atlas.cols*atlas.rows; j++) {
            var updateCrds = updateCoords(i, j);
            updateGeo = updateVertices(updateGeo, updateCrds)
            updateGeo = updateFaces(updateGeo)
            updateGeo = updateFaceVertexUvs(updateGeo, j)
        }
        updateMesh(updateGeo, materials_thumb[i], i);
    }
}

// real + STATIC position  (range : =50 ~ 50) --------------------------------->>>
function getCoords(i, j) {
    var imagePositions = {};
    var tsne_idx = (i * atlas.rows * atlas.cols) + j;

    imagePositions = Object.assign(imgPos_0, imgPos_1, imgPos_2, imgPos_3, imgPos_4, imgPos_5);

    var coords = imagePositions[tsne_idx];
    coords.x *= 500;
    coords.y *= 500;
    coords.z *= 100;
    return coords;
}

// update  position (starting random : -10000 ~ 100000)---------------------->>>
function updateCoords(i, j) {
    var curPositions = {};
    var tsne_idx = (i * atlas.rows * atlas.cols) + j;

    curPositions = Object.assign(curPos_0, curPos_1, curPos_2, curPos_3, curPos_4, curPos_5);

    var updateCoords = curPositions[tsne_idx];
    updateCoords.x = Math.random()*20000-10000;
    updateCoords.y = Math.random()*20000-10000;
    updateCoords.z = Math.random()*20000-10000;

    return updateCoords;
}

// mesh only COINTAINING STATIC POSITION ---------------------------------->>>
function buildMesh(geometry, material, idx) {
    var geometry = new THREE.BufferGeometry().fromGeometry(geometry);

    mesh[idx] = new THREE.Mesh(geometry, material);
    mesh[idx].position.set(0, 0, 0);
    update = false;
}


// mesh only COINTAINING update POSITION ---------------------------------->>>
function updateMesh(geometry, material, idx) {
    var geometry1 = new THREE.BufferGeometry().fromGeometry(geometry);

    curMesh[idx] = new THREE.Mesh(geometry1, material);
    curMesh[idx].position.set(0, 0, 0);
    scene.add(curMesh[idx]);
    targetList.push(curMesh[idx]);      // add curMesh info to targetList

    curUpdate = true;
}

function updateVertices(geometry, coords) {

    var inc = 1;
   // inc = Math.random() * 2;

    geometry.vertices.push(
        new THREE.Vector3(
            coords.x, 
            coords.y, 
            coords.z
        ),
        new THREE.Vector3(
            coords.x + image.width*inc, 
            coords.y, 
            coords.z
        ),
        new THREE.Vector3(
            coords.x + image.width*inc, 
            coords.y + image.height*inc, 
            coords.z
        ),
        new THREE.Vector3(
            coords.x, 
            coords.y + image.height*inc, 
            coords.z
        )
    );

    return geometry;
}

function updateFaces(geometry) {
    // Add the first face (the lower-right triangle)
    var faceOne = new THREE.Face3(
        geometry.vertices.length - 4, 
        geometry.vertices.length - 3, 
        geometry.vertices.length - 2
    )

    // Add the second face (the upper-left triangle)
    var faceTwo = new THREE.Face3(
        geometry.vertices.length - 4, 
        geometry.vertices.length - 2, 
        geometry.vertices.length - 1
    )

    // Add those faces to the geometry
    geometry.faces.push(faceOne, faceTwo);

    return geometry;
}

function updateFaceVertexUvs_(geometry, j) {
    var xOffset = (j % atlas.cols) * (image.width / atlas.width);
    var yOffset = 1 - (Math.floor(j / atlas.cols) * (image.height / atlas.height)) - (image.height / atlas.height);

    geometry.faceVertexUvs[0].push([
        new THREE.Vector2(xOffset/2, yOffset/2),
        new THREE.Vector2((xOffset + (image.width/atlas.width))/2, yOffset/2),
        new THREE.Vector2((xOffset + (image.width/atlas.width))/2, (yOffset + (image.height/atlas.height))/2)
    ]);
    
    geometry.faceVertexUvs[0].push([
        new THREE.Vector2(xOffset/2, yOffset/2),
        new THREE.Vector2((xOffset + (image.width/atlas.width))/2, (yOffset + (image.height/atlas.height))/2),
        new THREE.Vector2(xOffset/2, (yOffset + (image.height/atlas.height))/2)
    ]);

    return geometry;
}

function updateFaceVertexUvs(geometry, j) {

    var xOffset = (j % atlas.cols) * (image.width / atlas.width);
    var yOffset = 1 - (Math.floor(j / atlas.cols) * (image.height / atlas.height)) - (image.height / atlas.height);

    geometry.faceVertexUvs[0].push([
        new THREE.Vector2(xOffset, yOffset),
        new THREE.Vector2(xOffset + (image.width/atlas.width), yOffset),
        new THREE.Vector2(xOffset + (image.width/atlas.width), yOffset + (image.height/atlas.height))
    ]);
    
    geometry.faceVertexUvs[0].push([
        new THREE.Vector2(xOffset, yOffset),
        new THREE.Vector2(xOffset + (image.width/atlas.width), yOffset + (image.height/atlas.height)),
        new THREE.Vector2(xOffset, (yOffset + image.height/atlas.height))
    ]);

    return geometry;
}


function onWindowResize() {
    camera.aspect = screenW / screenH;
    camera.updateProjectionMatrix();
    renderer.setSize(screenW, screenH);
}

function render() {
    //camera update ++ camera control 
    //camera position need to be fixed!!!!!!
    camera.position.x=5000*Math.cos(3.14*(1-(screenX/screenW)));   
    camera.position.z = 5000-decreaseRate*1000;
    if(curUpdate) {
        for(var i=0; i<atlasNum; i++) {
            for(var j=0; j<mesh[i].geometry.attributes["position"].array.length; j++) {
                curMesh[i].geometry.attributes["position"].array[j] += (mesh[i].geometry.attributes["position"].array[j] - curMesh[i].geometry.attributes["position"].array[j]) * 0.01;

                curMesh[i].geometry.attributes.position.needsUpdate = true;
            
            }
        } 
    }
    renderer.render(scene, camera);
}

function mouse_position(event){
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    raycaster = new THREE.Raycaster(camera.position, vector.sub( camera.position ).normalize());
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects(targetList);

    if ( intersects.length > 0 ) {

        console.log('hits');
        console.log(intersects[0]);

        intersects[0].object.visible = false;
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

init();
animate();