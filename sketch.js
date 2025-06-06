let jugador = {
  imagen: null,
  puntuacion: 0,
  alto: 100,
  ancho: 70,
  x: 0,
  y: 0,
  vidas: 3
};

let jefeFinal = {
  imagen: null,
  vidas: 7,
  puntos: 10,
  alto: 80,
  ancho: 70,
  x: 200,
  y: 200,
  direccionX: 3
}
const STORAGE_KEY = "listaPuntaje";
let listaMisiles = [];
let listaMisilesEnemigos = [];
let tiempoMisilEnemigo = 0
let intervaloMisilesEnemigos = null;
let enemigosQueHanDisparado = [];
let misilEnemigoContador = 0;
let tipoMovimientoRandom = 0;
let apareceJefeFinal = false;

let musicaFondo;
let disparoJugador;
let disparoNaveII;
let naveDestruida;
let listaEnemigos = [];
let grupoNavesRandom = [];
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
  musicaFondo = loadSound('sound/musica_Fondo.mp3');
  disparoJugador = loadSound('sound/disparo.mp3');
  naveDestruida = loadSound('sound/nave_Destruida.mp3');
  disparoNaveII = loadSound('sound/disparo_Nave_II.mp3');
  jugador.imagen = loadImage('./img/nave.png');
  vidas_restantes = loadImage("./img/vidas.png")

  imgNaveEnemiga1 = loadImage('./img/nave_Enemiga.png');
  imgNaveEnemiga2 = loadImage('./img/nave_Enemiga_II.png');
  jefeFinal.imagen = loadImage('./img/nave_Enemiga_II.png');
  imgNaveEnemigaEspecial2 = loadImage('./img/nave_Enemiga_Especial_II.png');
  fondo = loadImage('./img/fondo.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  jugador.x = (windowWidth / 2 - 200) - jugador.ancho / 2;
  jugador.y = windowHeight - 150;
  musicaFondo.setVolume(0.5);
  musicaFondo.loop();
  setInterval(cambiarTipoMovimientoRandom, 1300);
  cambiarTipoMovimientoRandom();
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

    text("Mejores puntuaciones", windowWidth / 2, 50 - desplazamientoY);
    textSize(22);
    textAlign(LEFT, BASELINE);

    const top5 = obtenerCincoMejores();
    let bajarY = 30;
    if (top5.length == 0) {
      text("Aún no hay puntuaciones registradas", windowWidth / 2 - 180, 130 - desplazamientoY);
    }

    for (let i = 0; i < top5.length; i++) {
      let yTexto = 220 + bajarY - 150 - desplazamientoY;
      text(i + 1 + ". ", windowWidth / 2 - 160, yTexto);
      text(mostrar_puntaje(top5[i]), windowWidth / 2 + 100, yTexto);
      bajarY += 35;
    }

    textSize(42);
    textAlign(CENTER, CENTER);
    text("Presiona Enter para a jugar", windowWidth / 2, windowHeight / 2 + 350 - desplazamientoY);

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
    text("Tu puntuación es de: " + mostrar_puntaje(jugador.puntuacion), windowWidth / 2 - 550, windowHeight / 2 - 400);

    text("Presiona Enter para volver a jugar", windowWidth / 2 - 600, windowHeight / 2 + 200);

    const nuevaPuntuacion = insertarPuntaje(jugador.puntuacion);

    noLoop();
    juegoTerminado = true;
    return;

  }

  if (nivelTerminado) {
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

  //VALIDAR COLISIÓN DE JUGADOR CON JEFE FINAL
  if (jefeFinal.x < jugador.x + jugador.ancho &&
    jefeFinal.x + jefeFinal.ancho > jugador.x &&
    jefeFinal.y < jugador.y + jugador.alto + 30 &&
    jefeFinal.y + jugador.alto > jugador.y + 30) {
    jugador.vidas--;
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
          naveDestruida.play();
          break;
        }
      }
    }
  }
  //VALIDAR COLISION MISIL JUGADOR CON JEFE FINAL
  if (apareceJefeFinal) {
    for (let k = listaMisiles.length - 1; k >= 0; k--) {
      if (listaMisiles[k].x < jefeFinal.x + jefeFinal.ancho &&
        listaMisiles[k].x + listaMisiles[k].ancho > jefeFinal.x &&
        listaMisiles[k].y < jefeFinal.y + jefeFinal.alto &&
        listaMisiles[k].y + listaMisiles[k].alto > jefeFinal.y) {
        jefeFinal.vidas--;
        listaMisiles.splice(k, 1);
        if (jefeFinal.vidas == 0) {
          jugador.puntuacion += jefeFinal.puntos;
          naveDestruida.play();
          break;
        }
      }
    }
  }

  if (listaEnemigos.length == 0 && nivel != 3) {
    nivelTerminado = true;
    nivel++;
  }
  else if (listaEnemigos.length == 0 && nivel == 3) {
    apareceJefeFinal = true
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
  //VALIDAR COLISION MISIL DE JEFE FINAL CON JUGADOR
  if (apareceJefeFinal) {
    for (let i = listaMisilesEnemigos.length - 1; i >= 0; i--) {
      if (listaMisilesEnemigos[i].x < jugador.x + jugador.ancho &&
        listaMisilesEnemigos[i].x + listaMisilesEnemigos[i].ancho > jugador.x &&
        listaMisilesEnemigos[i].y < jugador.y + jugador.alto + 30 &&
        listaMisilesEnemigos[i].y + jugador.alto > jugador.y + 30) {
        listaMisilesEnemigos.splice(i, 1);
        jugador.vidas--;
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
  if (keyIsDown(RIGHT_ARROW) && (jugador.x + jugador.ancho) < (windowWidth - limiteAnchoCanvas)) {
    jugador.x += 9;
  }

  //FINALIZAR JUEGO SI EL JUGADOR DESTRUYE AL JEFE FINAL
  if (jefeFinal.vidas == 0) {
    fill('white');
    textSize(50);
    textAlign(CENTER, CENTER);

    const centroX = (windowWidth - limiteAnchoCanvas) / 2;
    const centroY = windowHeight / 2;

    text("Has completado el juego", centroX, centroY - 150);

    text("Tu puntuación es de: " + mostrar_puntaje(jugador.puntuacion), centroX, centroY - 50);

    text("Presiona Enter para volver a jugar", centroX, centroY + 100);

    const nuevaPuntuacion = insertarPuntaje(jugador.puntuacion);

    noLoop();
    juegoTerminado = true;
  }

}



function keyPressed() {
  //LANZAR MISILES CON LA TECLA ESPACIO
  if (keyCode === 32 && subirMenu > 0) {
    crearMisil();
    disparoJugador.play();
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
  //POR HACER: AGREGAR UNA CONDICION QUE HAGA QUE NO SE EJECUTE SI EL JUGADOR COMPLETA EL JUEGO
  if (nivel === 1 || jugador.vidas === 0) {
    return;
  }

  if (!apareceJefeFinal) {
    // Si ya todos dispararon, reiniciar la lista
    if (enemigosQueHanDisparado.length >= listaEnemigos.length) {
      enemigosQueHanDisparado = [];
    }

    let EnemigosQueNoHanDisparado = [];
    for (let i = 0; i < listaEnemigos.length; i++) {
      if (!enemigosQueHanDisparado.includes(i)) {
        EnemigosQueNoHanDisparado.push(i);
      }
    }
    //Seleccionar uno aleatorio de los enemigos que no han disparado
    let indiceAleatorio = numeroRandom(0, EnemigosQueNoHanDisparado.length);
    let i = EnemigosQueNoHanDisparado[indiceAleatorio];

    // Crear misil
    let misil = {
      alto: 60,
      ancho: 5,
      colorFondo: "yellow",
      x: listaEnemigos[i].x + 33,
      y: listaEnemigos[i].y + 100
    };

    //AUMENTAR CONTADOR EN CUANTO INICIA EL NIVEL 3
    if (nivel == 3) {
      misilEnemigoContador++;
    }
    /*if(misilEnemigoContador == 5 && nivel == 2 ){
      todosDisparan()
      misilEnemigoContador = 0;
    }*/
    if (misilEnemigoContador == 10 && nivel == 3) {
      todosDisparan()
      misilEnemigoContador = 0;
    }
    listaMisilesEnemigos.push(misil);
    disparoNaveII.play();
    enemigosQueHanDisparado.push(i);

  } else {
    let misil = {
      alto: 60,
      ancho: 5,
      colorFondo: "yellow",
      x: jefeFinal.x + 33,
      y: jefeFinal.y + 100
    };
    listaMisilesEnemigos.push(misil);

  }

}
function todosDisparan() {
  for (let enemigo of listaEnemigos) {
    crearMisilEnemigo(enemigo);
  }
}


//Ejecutar la función cada cierto tiempo
function configurarMisilesEnemigos() {
  //Antes de crear un nuevo setInterval, limpiamos el anterior (si existía):
  if (intervaloMisilesEnemigos !== null) {
    clearInterval(intervaloMisilesEnemigos);
    intervaloMisilesEnemigos = null;
  }

  if (nivel === 2) {
    tiempoMisilEnemigo = 1000;
  } else if (nivel === 3) {
    tiempoMisilEnemigo = 500;
  } else {
    return;
  }


  intervaloMisilesEnemigos = setInterval(crearMisilEnemigo, tiempoMisilEnemigo);
}

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
        for (let j = 500; j <= 890; j += 130) {
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
      for (let i = -280; i < 80; i += 100) {
        for (let j = 140; j <= 1250; j += 130) {
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
      configurarMisilesEnemigos()
      nivelTerminado = false;
      break;
    case 3:
      for (let i = -280; i < 80; i += 100) {
        for (let j = 140; j <= 1250; j += 130) {
          let enemigo = {
            imagen: imgNaveEnemiga2,
            vidas: 1,
            puntos: 1,
            alto: 80,
            ancho: 70,
            x: j,
            y: i,
            direccionX: 1,
            direccionY: 1,
            contadorMovimiento: 0
          };
          listaEnemigos.push(enemigo);
        }
      }
      //Crear de manera aleatoria el enemigo especial
      let i = 0
      while (i < 2) {
        i++
        const navesRandom = Math.floor(Math.random() * listaEnemigos.length);
        listaEnemigos[navesRandom].imagen = imgNaveEnemigaEspecial2;
        listaEnemigos[navesRandom].vidas = 3;
        listaEnemigos[navesRandom].puntos = 3;
      }
      configurarMisilesEnemigos()
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
        listaEnemigos[i].y += 0.35;
        if (listaEnemigos[i].x + listaEnemigos[i].ancho >= windowWidth - limiteAnchoCanvas || listaEnemigos[i].x <= 0) {
          for (let k = listaEnemigos.length - 1; k >= 0; k--) {
            listaEnemigos[k].direccionX = -listaEnemigos[k].direccionX;
          }
        }
      }
      break;
    case 3:
      for (let i = listaEnemigos.length - 1; i >= 0; i--) {
        image(listaEnemigos[i].imagen, listaEnemigos[i].x, listaEnemigos[i].y, listaEnemigos[i].ancho, listaEnemigos[i].alto);
        listaEnemigos[i].y += 0.4;

        switch (tipoMovimientoRandom) {
          case 1:
            //MOVIMIENTO ZIG ZAG
            listaEnemigos[i].x += listaEnemigos[i].direccionX * 2.5;
            listaEnemigos[i].y += 0.35;
            break;
          case 2:
            //MOVIMIENTO ARRIBA Y ABAJO BRUSCO
            if (listaEnemigos[i].contadorMovimiento < 50) {
              //ESTE IF SIRVE PARA, DEPENDIENDO LA DIRECCION Y, AUMENTAR O DISMINUIR EL ICNREMENTO Y QUE SIEMPRE BAJEN MAS LAS NAVES DE LO QUE SUBEN
              if (listaEnemigos[i].direccionY == 1) {
                listaEnemigos[i].y += 2 * listaEnemigos[i].direccionY;
                listaEnemigos[i].contadorMovimiento++;
              } else {
                listaEnemigos[i].y += 1 * listaEnemigos[i].direccionY;
                listaEnemigos[i].contadorMovimiento++;
              }
            } else {
              listaEnemigos[i].direccionY *= -1;
              listaEnemigos[i].contadorMovimiento = 0;
            }
            break;
          case 3:
            //MOVIMIENTO NAVES EN GRUPO
            if (grupoNavesRandom.includes(listaEnemigos[i])) {
              do {
                listaEnemigos[i].direccionX = floor(random(-1, 1));
              } while (listaEnemigos[i].direccionX == 0);
              do {
                listaEnemigos[i].direccionY = floor(random(-1, 1));
              } while (listaEnemigos[i].direccionY == 0);
              listaEnemigos[i].x += listaEnemigos[i].direccionX * random(0.1, 2.5);
              listaEnemigos[i].y += listaEnemigos[i].direccionY * random(0.1, 1);
            }

            break;
        }

        if (listaEnemigos[i].x + listaEnemigos[i].ancho >= windowWidth - limiteAnchoCanvas || listaEnemigos[i].x <= 0) {
          for (let k = listaEnemigos.length - 1; k >= 0; k--) {
            listaEnemigos[k].direccionX = -listaEnemigos[k].direccionX;
          }
        }
      }
      break;
  }
  if (apareceJefeFinal) {
    image(jefeFinal.imagen, jefeFinal.x, jefeFinal.y, jefeFinal.ancho, jefeFinal.alto)

    jefeFinal.x += jefeFinal.direccionX;
    jefeFinal.y += 1;
    if (jefeFinal.x + jefeFinal.ancho >= windowWidth - limiteAnchoCanvas || jefeFinal.x <= 0) {
      jefeFinal.direccionX = -jefeFinal.direccionX;
    }
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
  misilEnemigoContador = 0;
  apareceJefeFinal = false;

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

function cambiarTipoMovimientoRandom() {
  tipoMovimientoRandom = Math.floor(random(1, 4));
  if (tipoMovimientoRandom == 3) {
    grupoNavesRandom = [];
    for (let j = 0; j <= 9; j++) {
      const navesRandomGrupo = Math.floor(Math.random() * listaEnemigos.length);
      if (!grupoNavesRandom.includes(listaEnemigos[navesRandomGrupo])) {
        grupoNavesRandom.push(listaEnemigos[navesRandomGrupo]);
      }
      console.log("estoy entrando al for que se supone llena el arreglo")
    }
  } else {
    grupoNavesRandom = [];
  }
}
