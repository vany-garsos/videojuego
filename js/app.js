const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/*cargar las imagenes*/
const imgJugador = new Image();
imgJugador.src = "img/calavera.png";

const imgMalo = new Image();
imgMalo.src = "img/malo.png";

const imgBueno = new Image();
imgBueno.src = "img/bueno.png";

const imgFondo = new Image();
imgFondo.src = "img/fondo.jpg";

const imgTeclas = new Image();
imgTeclas.src = "img/teclas.png";

/*Posicion inicial del jugador*/
const player = { x: 80, y: 380, w: 70, h: 90, vx: 0, vy: 0 };

/*posicion del boton*/
const btn = { x: 330, y: 420, w: 130, h: 40 };

/*posicion de la imagen cuando pierde/gana*/
const img = { x: 0, y: 150, w: 150, h: 150 };

/*posicion de la imagen de teclas(indica al jugador que teclas usar)*/
const imgTecla = { x: 0, y: 170, w: 100, h: 70 };

let keys = {};
let enemigos = [];
let amigos = [];
let vidas = 3;
let estado = "inicio";
let nivel = 1;
let velMin = 1;
let velMax = 2;

function crearEnemigo() { 
  enemigos.push({ x: aleatorio(0, 750), y: 0, w: 40, h: 40, vy: aleatorio(velMin, velMax) });
}

function crearAmigo() {
  amigos.push({ x: aleatorio(0, 750), y: 0, w: 30, h: 35, vy: aleatorio(velMin, velMax) });
}

document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

/*cuando se haga click en el boton 'jugar o volver a jugar'*/
canvas.addEventListener("click", (e) => {
  let clickX = e.offsetX;
  let clickY = e.offsetY;

  if (clickX < btn.x + btn.w &&
      clickX > btn.x &&
      clickY > btn.y &&
      clickY < btn.y + btn.h) {
        estado = "jugar";
        vidas = 3;
        nivel = 1;
        velMin = 1;
        velMax = 2;
  }
});

function update() {
  /*funciones para mover el personaje*/
  if (keys["ArrowLeft"] && player.x > 0) {
    player.vx = -4;
  } else if (keys["ArrowRight"] && player.x <= 730) {
    player.vx = 4;
  } else {
    player.vx = 0;
  }
  player.x += player.vx;

  /*muevo el enemigo*/
  enemigos.forEach((enemigo) => (enemigo.y += enemigo.vy));
  /*elimino al enemigo que llego abajo*/
  enemigos = enemigos.filter((enemigo) => enemigo.y + enemigo.h < 480);

  /*muevo el amigo*/
  amigos.forEach((amigo) => (amigo.y += amigo.vy));
  /*elimino al amigo que llego abajo*/
  amigos = amigos.filter((amigo) => amigo.y + amigo.h < 480);

  if (Math.random() < 0.01) {
    crearEnemigo();
  }

  if (Math.random() < 0.005) {
    crearAmigo();
  }

  /*si hay colision con enemigos, decrementar vidas*/
  enemigos.forEach((enemigo, indice) => {
    if (colision(player, enemigo)) {
      if (vidas > 0) {
        vidas--;
       if (vidas == 0) {
          pantallaPerder.mostrar();
        }
      }
      enemigos.splice(indice, 1);
    }
  });

  /*si hay colision con amigos, incrementar vidas, subir nivel y velocidad*/
  amigos.forEach((amigo, indice) => {
    if (colision(player, amigo)) {
        vidas++;
        if (vidas == 6 && nivel == 1) {
          nivel = 2;
          velMin = 2;
          velMax = 4;
        } else if (vidas == 11 && nivel == 2) {
          nivel = 3;
          velMin = 4;
          velMax = 6;
        } if (vidas == 15) {
          pantallaGanar.mostrar();
        } 
      amigos.splice(indice, 1);
    }
  });

  function colision(player, item) {
    return (
      player.x < item.x + item.w &&
      player.x + player.w > item.x &&
      player.y < item.y + item.h &&
      player.y + player.h > item.y
    );
  }
}

function draw() {
  ctx.clearRect(0, 0, 800, 480);

  if (imgFondo.complete) {
    ctx.drawImage(imgFondo, 0, 0, 800, 480);
  }

  if (imgJugador.complete) {
    ctx.drawImage(imgJugador, player.x, player.y, player.w, player.h);
  }

  enemigos.forEach((enemigo) => {
    if (imgMalo.complete) {
      ctx.drawImage(imgMalo, enemigo.x, enemigo.y, enemigo.w, enemigo.h);
    }
  });

  amigos.forEach((amigo) => {
    if (imgBueno.complete) {
      ctx.drawImage(imgBueno, amigo.x, amigo.y, amigo.w, amigo.h);
    }
  });

  /*marcador*/
  ctx.fillStyle = "red";
  ctx.font = "18px Arial";
  ctx.fillText("Nivel: " + nivel, 50, 30);
  ctx.fillText("Vidas: " + vidas, 50, 50);
}

/*numero aleatorio entre max y min*/
function aleatorio(min, max) {
  return Math.random() * (max - min + 1) + min;
}

/*clase para las pantallas de inicio, perder y ganar*/
class Pantalla {
  constructor(estadoJuego, texto, imagen, textoBoton) {
    this.estadoJuego = estadoJuego;
    this.texto = texto;
    this.imagen = imagen;
    this.textoBoton = textoBoton;
    /*calcula el centro del canvas*/
    this.centroX = canvas.width / 2;
    /*calcula el centro de la imagen*/
    this.centroImg = (canvas.width - img.w) / 2;
  }

  mostrar() {
    draw();
    estado = this.estadoJuego;

    /*fondo transparente negro*/
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, 800, 480);

    /*centra el texto respectoa un punto*/
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    /*texto que indica si has perdido o has ganado*/
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText(this.texto, this.centroX, 50);

    /*imagen de fantasma cuando pierde/gana*/
    if(this.imagen != null){
      ctx.drawImage(this.imagen, this.centroImg, img.y, img.w, img.h);
    }
    
    /*boton*/
    ctx.fillStyle = "green";
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

    ctx.fillStyle = "white";
    ctx.font = "15px Arial";
    const btnCentroX = btn.x + btn.w / 2;
    const btnCentroY = btn.y + btn.h / 2;

    ctx.fillText(this.textoBoton, btnCentroX, btnCentroY);
  }
}

class PantallaInicio extends Pantalla {
  constructor() {
    super("inicio", "¿Cómo jugar?", null, "Jugar");
  }

  indicaciones() {
    ctx.font = "15px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(
      "Atrapa almas buenas y esquiva a las malditas, el destino de la calavera está en juego",
      this.centroX,
      90
    );
    ctx.fillText(
      "Usa las flechas del taclado para moverte de izquierda a derecha",
      this.centroX,
      130
    );
    ctx.drawImage(
      imgTeclas,
      this.centroX - imgTecla.w/2,
      imgTecla.y,
      imgTecla.w,
      imgTecla.h
    );
    ctx.fillText("Inicialmente tienes 3 vidas", this.centroX, 280);
    ctx.fillText(
      "Cada vez que toques un alma maldita, perderás 1 vida",
      this.centroX,
      320
    );
    ctx.fillText(
      "Cada vez que atrapes un alma buena, ganarás 1 vida",
      this.centroX,
      360
    );
    ctx.fillText("Ganas una vez que reunas 15 vidas", this.centroX, 400);
  }
}

/*instancia de la pantalla de inicio*/
const pantallaInicio = new PantallaInicio();

/*instancia de la pantalla de perder*/
const pantallaPerder = new Pantalla("perder", "¡Perdiste!, las almas malditas te rodean", imgMalo, "Volver a jugar");

/*instancia de la pantalla de ganar*/
const pantallaGanar = new Pantalla("ganar", "¡Ganaste!, tu alma brilla entre las sombras", imgBueno, "Volver a jugar");

function loop() {
  if (estado == "inicio") {
    pantallaInicio.mostrar();
    pantallaInicio.indicaciones();
  } else if (estado == "jugar") {
    update();
    draw();
  } else if (estado == "perder") {
    pantallaPerder.mostrar();
  } else {
    pantallaGanar.mostrar();
  }
  requestAnimationFrame(loop);
}
loop();