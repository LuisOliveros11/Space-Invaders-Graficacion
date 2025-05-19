let jugador = {
  imagen: null,
  puntuacion: 0,
  vidas: 3,
  alto: 100,
  ancho: 70,
  x: 0,
  y: 0,
  puntuacion: 0,
  vidas: 3
};
let listaMisiles = [];
let listaEnemigos = [];
let nivel = 1;
let nivelTerminado = true;

function preload() {
  jugador.imagen = loadImage('./img/nave.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  jugador.x = windowWidth / 2 - jugador.ancho / 2;
  jugador.y = windowHeight - 150;
}

function draw() {
  background("black");

  fill("white")
  textSize(15);
  textAlign(LEFT, BASELINE);
  text('Nivel: ' + nivel, 100, 30);
  text('Puntuación: ' + jugador.puntuacion, 200, 30);
  text('Vidas restantes: ' + jugador.vidas, 350, 30);

  if (nivelTerminado) {
    nivelJuego();
  }

  //DIBUJAR JUGADOR
  image(jugador.imagen, jugador.x, jugador.y, jugador.ancho, jugador.alto);

  //MOVIMIENTO DE LOS ENEMIGOS
  movimientoEnemigos()

  //VALIDAR COLISION MISIL JUGADOR CON NAVE ENEMIGA
  for (let i = listaEnemigos.length - 1; i >= 0; i--) {
    for (let k = listaMisiles.length - 1; k >= 0; k--) {
      if (listaMisiles[k].x < listaEnemigos[i].x + listaEnemigos[i].ancho &&
        listaMisiles[k].x + listaMisiles[k].ancho > listaEnemigos[i].x &&
        listaMisiles[k].y < listaEnemigos[i].y + listaEnemigos[i].alto &&
        listaMisiles[k].y + listaMisiles[k].alto > listaEnemigos[i].y) {
        listaEnemigos.splice(i, 1);
        listaMisiles.splice(k, 1);
        jugador.puntuacion++;
        break;
      }
    }
  }

  //DIBUJAR MISILES
  eliminarMisil();
  for (let i = listaMisiles.length - 1; i >= 0; i--) {
    fill(listaMisiles[i].colorFondo)
    rect(listaMisiles[i].x, listaMisiles[i].y, listaMisiles[i].ancho, listaMisiles[i].alto);
    listaMisiles[i].y -= 5;
  }

  //CONTROLA MOVIMIENTO DEL JUGADOR 
  if (keyIsDown(LEFT_ARROW) && jugador.x > 0) {
    jugador.x -= 9;
  }
  if (keyIsDown(RIGHT_ARROW) && (jugador.x + jugador.ancho) < windowWidth) {
    jugador.x += 9;
  }

}

//LANZAR MISILES CON LA TECLA ESPACIO
function keyPressed() {
  if (keyCode === 32) {
    crearMisil();
  }
}

function crearMisil() {
  let misil = {
    alto: 60,
    ancho: 5,
    colorFondo: "red",
    x: jugador.x + 33,
    y: jugador.y - 60
  };
  listaMisiles.push(misil);
}

function eliminarMisil() {
  for (let i = listaMisiles.length - 1; i >= 0; i--) {
    if (listaMisiles[i].y < -60) {
      listaMisiles.splice(i, 1);
    }
  }
}

function nivelJuego() {
  switch (nivel) {
    case 1:
      for (let i = 80; i <= 330; i += 100) {
        for (let j = 700; j <= 1090; j += 130) {
          let enemigo = {
            imagen: loadImage('./img/nave_Enemiga.png'),
            vidas: 1,
            alto: 80,
            ancho: 70,
            x: j,
            y: i,
            direccionX: 1
          };
          listaEnemigos.push(enemigo);
        }
      }
      nivelTerminado = false;
      break;
  }
}

function movimientoEnemigos() {
  for (let i = listaEnemigos.length - 1; i >= 0; i--) {
    image(listaEnemigos[i].imagen, listaEnemigos[i].x, listaEnemigos[i].y, listaEnemigos[i].ancho, listaEnemigos[i].alto);
    listaEnemigos[i].x += listaEnemigos[i].direccionX * 2.5;
    if(listaEnemigos[i].x + listaEnemigos[i].ancho >= windowWidth || listaEnemigos[i].x <= 0){
      for (let k = listaEnemigos.length - 1; k >= 0; k--) {
        listaEnemigos[k].direccionX = -listaEnemigos[k].direccionX;
        listaEnemigos[k].y += 10;
      }
    }
  }
}