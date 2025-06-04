let jugador = {
  imagen: null,
  puntuacion: 0,
  alto: 100,
  ancho: 70,
  x: 0,
  y: 0,
  vidas: 3
};
const STORAGE_KEY = "listaPuntaje";
let listaMisiles = [];
let listaMisilesEnemigos = [];
let tiempoMisilEnemigo = 1500

let listaEnemigos = [];
let nivel = 1;
let nivelTerminado = true;

let juegoTerminado = false;

let juegoEmpezado = false;
let cuadradoEmpezarJuegoX = window.innerWidth - 500;
let cuadradoEmpezarJuegoY = window.innerHeight;
let limiteAnchoCanvas = 500;
let subirMenu = 0;
let banderaTeclaEnter = false

let transicion_bandera = true;
let contador_transicion = 0

function preload() {
  portada = loadImage("./img/portada.jpg")

  jugador.imagen = loadImage('./img/nave.png');
  vidas_restantes = loadImage("./img/vidas.png")

  imgNaveEnemiga1 = loadImage('./img/nave_Enemiga.png');
  imgNaveEnemiga2 = loadImage('./img/nave_Enemiga_II.png');
  imgNaveEnemigaEspecial2 = loadImage('./img/nave_Enemiga_Especial_II.png');
  fondo = loadImage('./img/fondo.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  jugador.x = windowWidth / 2 - jugador.ancho / 2;
  jugador.y = windowHeight - 150;
  const top5 = obtenerCincoMejores();
  console.log("Top 5 actual:", top5);
}

function draw() {
  image(fondo, -limiteAnchoCanvas, 0, windowWidth, windowHeight);

  //BARRA LATERAL
  fill('black');
  noStroke();
  rect(windowWidth - limiteAnchoCanvas, 0, limiteAnchoCanvas, windowHeight);

  //MOSTRAR PANTALLA DE INICIO
  if (juegoEmpezado == false) {
    let desplazamientoY = windowHeight - cuadradoEmpezarJuegoY;
    image(portada, 0, 0, windowWidth, cuadradoEmpezarJuegoY)
    textSize(32);
    fill("white");
    textAlign(CENTER, CENTER);

    text("Mejores puntuaciones", windowWidth / 2, windowHeight / 2 - 200 - desplazamientoY);
    textSize(22);
    textAlign(LEFT, BASELINE);

    const top5 = obtenerCincoMejores();
    let bajarY = 30;

    for (let i = 0; i < top5.length; i++) {
      let yTexto = windowHeight / 2 + bajarY - 150 - desplazamientoY;
      text(i + 1 + ". ", windowWidth / 2 - 160, yTexto);
      text(mostrar_puntaje(top5[i]), windowWidth / 2 + 100, yTexto);
      bajarY += 35;
    }

    text("Presiona Enter para a jugar", windowWidth / 2 - 140, windowHeight / 2 + 200 - desplazamientoY);

    cuadradoEmpezarJuegoY -= subirMenu;
    if (cuadradoEmpezarJuegoY <= 0) {
      juegoEmpezado = true
    }
    return;
  }

  //INFORMACIÓN DENTRO DE LA BARRA LATERAL (NIVEL, VIDAS, ETC)
  fill('white');
  textAlign(LEFT);
  textSize(35);
  const barraLateralX = windowWidth - limiteAnchoCanvas + 50;
  text("Nivel:  " + nivel, barraLateralX, 130);
  text("Puntuación:  " + mostrar_puntaje(jugador.puntuacion), barraLateralX, 180);
  text("Vidas:  ", barraLateralX, 380);
  mostrar_vidas()

  fill("white")
  textSize(15);


  if (jugador.vidas <= 0) {
    textSize(50);
    text("Tu puntuación es de: " + mostrar_puntaje(jugador.puntuacion), windowWidth / 2 - 350, windowHeight / 2 - 400);

    text("Presiona Enter para volver a jugar", windowWidth / 2 - 400, windowHeight / 2 + 200);

    const nuevaPuntuacion = insertarPuntaje(jugador.puntuacion);
    console.log("Nueva puntuacion:", nuevaPuntuacion);

    noLoop();
    juegoTerminado = true;
    return;

  }

  if (nivelTerminado) {
    console.log("alo")
    contador_transicion = 0
    transicion_bandera = true;

    nivelJuego();
  }


  //DIBUJAR JUGADOR
  image(jugador.imagen, jugador.x, jugador.y, jugador.ancho, jugador.alto);

  //MOVIMIENTO DE LOS ENEMIGOS
  if (transicion_bandera) {
    transicion();
  } else {
    movimientoEnemigos();
  }

  //VALIDAR COLISION JUGADOR CON NAVE ENEMIGA
  for (let i = listaEnemigos.length - 1; i >= 0; i--) {
    if (listaEnemigos[i].x < jugador.x + jugador.ancho &&
      listaEnemigos[i].x + listaEnemigos[i].ancho > jugador.x &&
      listaEnemigos[i].y < jugador.y + jugador.alto + 30 &&
      listaEnemigos[i].y + jugador.alto > jugador.y + 30) {
      jugador.vidas--;
      break;
    }
  }

  if (listaEnemigos.length == 0) {
    nivelTerminado = true;
    nivel++;
  }

  //VALIDAR COLISION MISIL JUGADOR CON NAVE ENEMIGA
  for (let i = listaEnemigos.length - 1; i >= 0; i--) {
    for (let k = listaMisiles.length - 1; k >= 0; k--) {
      if (listaMisiles[k].x < listaEnemigos[i].x + listaEnemigos[i].ancho &&
        listaMisiles[k].x + listaMisiles[k].ancho > listaEnemigos[i].x &&
        listaMisiles[k].y < listaEnemigos[i].y + listaEnemigos[i].alto &&
        listaMisiles[k].y + listaMisiles[k].alto > listaEnemigos[i].y) {
        listaEnemigos[i].vidas--;
        listaMisiles.splice(k, 1);
        if (listaEnemigos[i].vidas == 0) {
          jugador.puntuacion += listaEnemigos[i].puntos;
          listaEnemigos.splice(i, 1);
          break;
        }
      }
    }
  }

  if (listaEnemigos.length == 0) {
    nivelTerminado = true;
    nivel++;
  }

  //VALIDAR COLISION MISIL ENEMIGO CON JUGADOR
  for (let i = listaEnemigos.length - 1; i >= 0; i--) {
    for (let k = listaMisilesEnemigos.length - 1; k >= 0; k--) {
      if (listaMisilesEnemigos[k].x < jugador.x + jugador.ancho &&
        listaMisilesEnemigos[k].x + listaMisilesEnemigos[k].ancho > jugador.x &&
        listaMisilesEnemigos[k].y < jugador.y + jugador.alto + 30 &&
        listaMisilesEnemigos[k].y + jugador.alto > jugador.y + 30) {
        listaMisilesEnemigos.splice(k, 1);
        jugador.vidas--;
        break;
      }
    }
  }

  //Eliminar misiles fuera de pantalla para liberar espacio del arreglo
  eliminarMisil();
  eliminarMisilEnemigo();

  //Dibujar misiles
  for (let i = listaMisiles.length - 1; i >= 0; i--) {
    fill(listaMisiles[i].colorFondo)
    rect(listaMisiles[i].x, listaMisiles[i].y, listaMisiles[i].ancho, listaMisiles[i].alto);
    listaMisiles[i].y -= 5;
  }
  for (let i = listaMisilesEnemigos.length - 1; i >= 0; i--) {
    fill(listaMisilesEnemigos[i].colorFondo)
    rect(listaMisilesEnemigos[i].x, listaMisilesEnemigos[i].y, listaMisilesEnemigos[i].ancho, listaMisilesEnemigos[i].alto);
    listaMisilesEnemigos[i].y += 5;
  }

  //CONTROLA MOVIMIENTO DEL JUGADOR 
  if (keyIsDown(LEFT_ARROW) && jugador.x > 0) {
    jugador.x -= 9;
  }
  if (keyIsDown(RIGHT_ARROW) && (jugador.x + jugador.ancho) < windowWidth) {
    jugador.x += 9;
  }

}



function keyPressed() {
  //LANZAR MISILES CON LA TECLA ESPACIO
  if (keyCode === 32 && subirMenu > 0) {
    crearMisil();
  }
  //REINICIAR JUEGO
  if (juegoTerminado && keyCode === ENTER) {
    reiniciarJuego();
    banderaTeclaEnter = true;

  }
  //INICIAR JUEGO
  if (!juegoTerminado && subirMenu == 0 && keyCode === ENTER) {
    if (banderaTeclaEnter) {
      banderaTeclaEnter = false;
      return;
    }
    subirMenu = 8;
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
function crearMisilEnemigo() {
  if (listaEnemigos.length == 0 || nivel == 1) {
    return;
  }

  let i = numeroRandom(0, listaEnemigos.length)

  let misil = {
    alto: 60,
    ancho: 5,
    colorFondo: "yellow",
    x: listaEnemigos[i].x + 33,
    y: listaEnemigos[i].y + 100
  };
  listaMisilesEnemigos.push(misil);
}

//Ejecutar la función cada cierto tiempo
setInterval(crearMisilEnemigo, tiempoMisilEnemigo)

function transicionEmpezarJuego() {
  if (juegoEmpezado == false) {
    fill('black')
    rect(0, 0, windowWidth, windowHeight - 100)
    textSize(32);
    fill("white");

    text("¡Juego finalizado!", windowWidth / 2, windowHeight / 2 - 100);
    noLoop()
    return;
  }


}

function eliminarMisil() {
  for (let i = listaMisiles.length - 1; i >= 0; i--) {
    if (listaMisiles[i].y < -60) {
      listaMisiles.splice(i, 1);
    }
  }
}
function eliminarMisilEnemigo() {
  for (let i = listaMisilesEnemigos.length - 1; i >= 0; i--) {
    if (listaMisilesEnemigos[i].y > windowHeight) {
      listaMisilesEnemigos.splice(i, 1);
    }
  }
}

function nivelJuego() {
  switch (nivel) {
    case 1:
      for (let i = -180; i <= 180; i += 100) {
        for (let j = 700; j <= 1090; j += 130) {
          let enemigo = {
            imagen: imgNaveEnemiga1,
            vidas: 1,
            puntos: 1,
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
    case 2:
      for (let i = -280; i <= 180; i += 100) {
        for (let j = 440; j <= 1350; j += 130) {
          let enemigo = {
            imagen: imgNaveEnemiga2,
            vidas: 1,
            puntos: 1,
            alto: 80,
            ancho: 70,
            x: j,
            y: i,
            direccionX: 1
          };
          listaEnemigos.push(enemigo);
        }
      }
      //Crear de manera aleatoria el enemigo especial
      const naveRandom = Math.floor(Math.random() * listaEnemigos.length);
      listaEnemigos[naveRandom].imagen = imgNaveEnemigaEspecial2;
      listaEnemigos[naveRandom].vidas = 3;
      listaEnemigos[naveRandom].puntos = 3;
      nivelTerminado = false;
      break;
  }
}

function movimientoEnemigos() {
  switch (nivel) {
    case 1:
      for (let i = listaEnemigos.length - 1; i >= 0; i--) {
        image(listaEnemigos[i].imagen, listaEnemigos[i].x, listaEnemigos[i].y, listaEnemigos[i].ancho, listaEnemigos[i].alto);
        listaEnemigos[i].x += listaEnemigos[i].direccionX * 2.5;
        if (listaEnemigos[i].x + listaEnemigos[i].ancho >= windowWidth - limiteAnchoCanvas || listaEnemigos[i].x <= 0) {
          for (let k = listaEnemigos.length - 1; k >= 0; k--) {
            listaEnemigos[k].direccionX = -listaEnemigos[k].direccionX;
            listaEnemigos[k].y += 10;
          }
        }
        //SI EL ENEMIGO TOCA EL FONDO, EL JUGADOR PIERDE UNA VIDA
        if (listaEnemigos[i].y + listaEnemigos[i].alto >= windowHeight) {
          jugador.vidas--;
        }
      }
      break;
    case 2:
      for (let i = listaEnemigos.length - 1; i >= 0; i--) {
        image(listaEnemigos[i].imagen, listaEnemigos[i].x, listaEnemigos[i].y, listaEnemigos[i].ancho, listaEnemigos[i].alto);
        listaEnemigos[i].x += listaEnemigos[i].direccionX * 2.5;
        listaEnemigos[i].y += 0.15;
        if (listaEnemigos[i].x + listaEnemigos[i].ancho >= windowWidth - limiteAnchoCanvas || listaEnemigos[i].x <= 0) {
          for (let k = listaEnemigos.length - 1; k >= 0; k--) {
            listaEnemigos[k].direccionX = -listaEnemigos[k].direccionX;
          }
        }
      }
      break;
  }
}

function reiniciarJuego() {
  jugador.puntuacion = 0;
  jugador.vidas = 3;
  jugador.x = windowWidth / 2 - jugador.ancho / 2;
  jugador.y = windowHeight - 150;

  listaMisiles = [];
  listaMisilesEnemigos = [];
  listaEnemigos = [];

  nivel = 1;
  nivelTerminado = true;

  juegoTerminado = false;

  juegoEmpezado = false;
  cuadradoEmpezarJuegoX = window.innerWidth;
  cuadradoEmpezarJuegoY = window.innerHeight;
  subirMenu = 0;

  transicion_bandera = true;
  contador_transicion = 0;

  loop();
}

function numeroRandom(min, max) {
  const numeroMinimo = Math.ceil(min);
  const numeroMaximo = Math.floor(max);
  return Math.floor(Math.random() * (numeroMaximo - numeroMinimo) + numeroMinimo);
}

function cargarPuntaje() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) {
    return [];
  }
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) {
      return arr;
    }
    else {
      return [];
    }
  } catch (e) {
    console.warn("JSON inválido en localStorage.");
    return [];
  }
}

function guardarPuntaje(arreglo) {
  const arregloNumeros = arreglo
    .map(n => parseInt(n))
    .filter(n => !isNaN(n));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arregloNumeros));
}

function insertarPuntaje(nuevaPuntacion) {
  const puntajesActuales = cargarPuntaje();
  puntajesActuales.push(nuevaPuntacion);
  puntajesActuales.sort((a, b) => b - a);
  const top5 = puntajesActuales.slice(0, 5);
  guardarPuntaje(top5);
  return top5;
}

function obtenerCincoMejores() {
  const listaPuntuaciones = cargarPuntaje();
  listaPuntuaciones.sort((a, b) => b - a);
  return listaPuntuaciones.slice(0, 5);
}

function mostrar_puntaje(puntuacion, longitud = 5) {
  return puntuacion.toString().padStart(longitud, '0');
}

function mostrar_vidas() {

  const barraLateralX = windowWidth - limiteAnchoCanvas + 50;

  let saltoPosicionX = 0;
  for (let i = 0; i < jugador.vidas; i++) {
    image(vidas_restantes, barraLateralX + (saltoPosicionX + 130), 380 - 35, 50, 50);
    saltoPosicionX += 60;
  }
}

function transicion() {
  if (transicion_bandera) {

    for (let i = listaEnemigos.length - 1; i >= 0; i--) {
      image(listaEnemigos[i].imagen, listaEnemigos[i].x, listaEnemigos[i].y, listaEnemigos[i].ancho, listaEnemigos[i].alto);
      listaEnemigos[i].y += 3;
    }

    contador_transicion += 1;

    if (contador_transicion >= 60) {
      transicion_bandera = false;
    }
  }
}
