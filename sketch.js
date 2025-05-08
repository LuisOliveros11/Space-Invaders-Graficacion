let jugador = {
  imagen: null,
  puntuacion: 0,
  vidas: 3,
  alto: 100,
  ancho: 70,
  x: 350,
  y: 670
};
let listaMisiles = [];

function preload() {
  jugador.imagen = loadImage('https://imgs.search.brave.com/nkQ9s1cgC2AcJ1jZmtlDsxAZRREgspBMp-KWHPc2oRs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuc3RpY2twbmcu/Y29tL2ltYWdlcy81/ZjUzOTQ2ODA2MGYy/ZTAwMDQ4NTgwN2Yu/cG5n');
}

function setup() {
  createCanvas(800, 800);
}

function draw() {
  background(220);
  
  //DIBUJAR JUGADOR
  image(jugador.imagen, jugador.x, jugador.y, jugador.ancho,jugador.alto);
  
  //DIBUJAR MISILES
  eliminarMisil();
  for (let i = listaMisiles.length - 1; i >= 0; i--){ 
    fill(listaMisiles[i].colorFondo)
    rect(listaMisiles[i].x, listaMisiles[i].y, listaMisiles[i].ancho, listaMisiles[i].alto);
    listaMisiles[i].y-=5;
  }
  
    //CONTROLA MOVIMIENTO DEL JUGADOR 
  if(keyIsDown(LEFT_ARROW)  && jugador.x > 0) {
    jugador.x -= 9;
  }
  if(keyIsDown(RIGHT_ARROW)  && (jugador.x + jugador.ancho) < 800) {
    jugador.x += 9;
  }
}

//LANZAR MISILES CON LA TECLA ESPACIO
function keyPressed() {
  if (keyCode === 32) {
    crearMisil();
  }
}

function crearMisil(){
    let misil = {
    alto: 60,
    ancho: 5,
    colorFondo: "red",
    x: jugador.x + 33,
    y: jugador.y - 60
  };
  listaMisiles.push(misil);
}

function eliminarMisil(){
   for (let i = listaMisiles.length - 1; i >= 0; i--){ 
     if(listaMisiles[i].y < -60){
       listaMisiles.splice(i, 1);
     }
   }
}