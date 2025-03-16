"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Lista de imágenes para el juego
  var imagenes = [
    "/assets/images/projects/avengers/capitanamerica.png",
    "/assets/images/projects/avengers/iroman.png",
    "/assets/images/projects/avengers/superman.png",
    "/assets/images/projects/avengers/thor.png",
    "/assets/images/projects/avengers/batman.png",
    "/assets/images/projects/avengers/spiderman.png",
  ];

  // Referencias a elementos del DOM
  var contenedorJuego = document.getElementById("game-container");
  var pantallaInicio = document.getElementById("splash-screen");
  var botonInicio = document.getElementById("start-button");

  // Variables de estado
  var cartasAbiertas = [];
  var parejasEncontradas = 0;
  var tiempoRestante = 40;
  var intervaloTiempo;

  // URL de mi sitio (cámbiala según convenga)
  var urlMiSitio = "https://www.instagram.com/juanmendoza_25/";

  // Configuración de sonidos
  var sonidoVoltear = new Howl({ src: ["/assets/sounds/flip2.mp3"], volume: 0.6 });
  var sonidoGanar = new Howl({ src: ["./assets/sounds/wingame.mp3"], volume: 0.7 });
  var sonidoPerder = new Howl({ src: ["./assets/sounds/losegame.mp3"], volume: 0.7 });
  var sonidoCuentaAtras = new Howl({ src: ["/assets/sounds/reloj.mp3"], loop: true, volume: 0.3 });

  // Inicia el juego al hacer clic en el botón de "Comenzar"
  botonInicio.addEventListener("click", iniciarJuego);

  function iniciarJuego() {
    // Escondemos la pantalla de bienvenida
    pantallaInicio.style.display = "none";

    // Configuramos el contenedor del juego
    contenedorJuego.className = "";
    contenedorJuego.classList.add(
      "game-container",
      "grid",
      "grid-cols-4",
      "gap-4",
      "p-6",
      "bg-gray-800",
      "rounded-lg",
      "shadow-lg",
      "max-w-xl",
      "w-full"
    );

    reiniciarJuego();
    crearTablero();
  }

  function reiniciarJuego() {
    clearInterval(intervaloTiempo);
    sonidoCuentaAtras.stop();
    cartasAbiertas = [];
    parejasEncontradas = 0;
    tiempoRestante = 40;
    actualizarTemporizador();
  }

  function crearTablero() {
    contenedorJuego.innerHTML = "";
    // Duplicamos las imágenes para crear parejas
    var pares = imagenes.concat(imagenes);
    barajar(pares);
    pares.forEach(function (img) {
      contenedorJuego.appendChild(crearCarta(img));
    });
    iniciarTemporizador();
  }

  function crearCarta(img) {
    var carta = document.createElement("div");
    carta.classList.add("card");

    var interior = document.createElement("div");
    interior.classList.add("card-inner");

    var anverso = document.createElement("div");
    anverso.classList.add("card-front");
    anverso.textContent = "?";

    var reverso = document.createElement("div");
    reverso.classList.add("card-back");
    reverso.style.backgroundImage = "url(" + img + ")";

    interior.appendChild(anverso);
    interior.appendChild(reverso);
    carta.appendChild(interior);

    carta.addEventListener("click", function () {
      voltearCarta(carta, img);
    });

    return carta;
  }

  function voltearCarta(carta, img) {
    if (cartasAbiertas.length < 2 && !carta.classList.contains("flipped")) {
      carta.classList.add("flipped");
      sonidoVoltear.play();
      cartasAbiertas.push({ carta: carta, imagen: img });
      if (cartasAbiertas.length === 2) {
        setTimeout(comprobarPareja, 200);
      }
    }
  }

  function comprobarPareja() {
    var primera = cartasAbiertas[0],
        segunda = cartasAbiertas[1];

    if (primera.imagen === segunda.imagen) {
      parejasEncontradas++;
      cartasAbiertas = [];
      if (parejasEncontradas === imagenes.length) {
        clearInterval(intervaloTiempo);
        sonidoCuentaAtras.stop();
        sonidoGanar.play();
        mostrarModalFinal(true);
      }
    } else {
      setTimeout(function () {
        primera.carta.classList.remove("flipped");
        segunda.carta.classList.remove("flipped");
        cartasAbiertas = [];
      }, 1000);
    }
  }

  function iniciarTemporizador() {
    actualizarTemporizador();
    clearInterval(intervaloTiempo);
    intervaloTiempo = setInterval(function () {
      tiempoRestante--;
      actualizarTemporizador();
      if (tiempoRestante <= 0) {
        clearInterval(intervaloTiempo);
        sonidoCuentaAtras.stop();
        sonidoPerder.play();
        mostrarModalFinal(false);
      }
    }, 1000);
  }

  function actualizarTemporizador() {
    var timer = document.querySelector(".timer");
    if (!timer) {
      timer = document.createElement("div");
      timer.classList.add("timer");
      document.body.appendChild(timer);
    }
    timer.textContent = "Tiempo restante: " + tiempoRestante + " segundos";

    if (tiempoRestante <= 10) {
      timer.classList.add("red");
      gsap.to(timer, {
        duration: 0.5,
        scale: 1.1,
        yoyo: true,
        repeat: -1,
        transformOrigin: "50% 50%",
      });
      if (!sonidoCuentaAtras.playing()) {
        sonidoCuentaAtras.play();
      }
    } else {
      timer.classList.remove("red");
      gsap.killTweensOf(timer);
      gsap.set(timer, { scale: 1 });
      sonidoCuentaAtras.stop();
    }
  }

  function mostrarModalFinal(ganado) {
    var contenedorQR = document.createElement("div");
    contenedorQR.classList.add("qr-container");
    new QRCode(contenedorQR, {
      text: urlMiSitio,
      width: 150,
      height: 150,
    });

    var mensaje = ganado
      ? "¡Felicidades! Has ganado el juego."
      : "Se acabó el tiempo. Inténtalo de nuevo.";
    var mensajeExtra = "Escanea el código QR y sígueme en Instagram.";

    Swal.fire({
      title: ganado ? "¡Ganaste!" : "Perdiste :(",
      html:
        "<p>" +
        mensaje +
        "</p><p>" +
        mensajeExtra +
        "</p><div id='qr-code-container'></div>" +
        "<button id='reiniciar' class='swal2-confirm swal2-styled' style='display:block; margin:10px auto;'>Jugar de nuevo</button>",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: function () {
        var contenedorModalQR = Swal.getHtmlContainer().querySelector("#qr-code-container");
        contenedorModalQR.appendChild(contenedorQR);

        var btnReiniciar = Swal.getHtmlContainer().querySelector("#reiniciar");
        btnReiniciar.addEventListener("click", function () {
          Swal.close();
          reiniciarJuego();
          crearTablero();
        });
      },
    });
  }

  // Función para barajar el array de cartas (algoritmo de Fisher-Yates)
  function barajar(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
});
