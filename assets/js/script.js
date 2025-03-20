"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Variables globales
  let playerName = localStorage.getItem("playerName");

  // --- Fondo de "neuronas" animadas con GSAP ---
  var bgContainer = document.getElementById("background-animation");
  var neurons = []; // Array para almacenar las referencias a las neuronas
  var neuronCount = 30; // Puedes ajustar la cantidad de neuronas

  // Crear las neuronas
  for (let i = 0; i < neuronCount; i++) {
    let neuron = document.createElement("div");
    neuron.classList.add("neuron");
    // Posición inicial aleatoria
    neuron.style.left = Math.random() * window.innerWidth + "px";
    neuron.style.top = Math.random() * window.innerHeight + "px";
    bgContainer.appendChild(neuron);
    neurons.push(neuron);

    // Animación de movimiento continuo
    animateNeuron(neuron);

    // Animación de pulso (escala)
    gsap.to(neuron, {
      scale: 1.4,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  // Función para animar cada neurona hacia una nueva posición aleatoria
  function animateNeuron(neuron) {
    let newLeft = Math.random() * window.innerWidth;
    let newTop = Math.random() * window.innerHeight;
    let duration = 5 + Math.random() * 5; // Duración variable entre 5 y 10 segundos
    gsap.to(neuron, {
      duration: duration,
      left: newLeft,
      top: newTop,
      ease: "sine.inOut",
      onComplete: function () {
        animateNeuron(neuron); // Al finalizar, se elige un nuevo destino
      },
    });
  }

  // Interactividad: efecto repulsivo cuando el mouse se acerca a las neuronas
  document.addEventListener("mousemove", function (e) {
    neurons.forEach(function (neuron) {
      if (neuron.isReacting) return; // Evita múltiples animaciones simultáneas
      let rect = neuron.getBoundingClientRect();
      let centerX = rect.left + rect.width / 2;
      let centerY = rect.top + rect.height / 2;
      let dx = centerX - e.clientX;
      let dy = centerY - e.clientY;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        // Si el mouse está cerca (menos de 100px)
        neuron.isReacting = true;
        let angle = Math.atan2(dy, dx);
        let offset = 40; // Fuerza de repulsión
        let offsetX = Math.cos(angle) * offset;
        let offsetY = Math.sin(angle) * offset;
        gsap.to(neuron, {
          x: offsetX,
          y: offsetY,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: function () {
            gsap.to(neuron, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
              onComplete: function () {
                neuron.isReacting = false;
              },
            });
          },
        });
      }
    });
  });

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
  var tiempoRestante = 15;
  var intervaloTiempo;

  // URL de mi sitio (cámbiala según convenga)
  var urlMiSitio = "https://www.instagram.com/juanmendoza_25/";

  // Configuración de sonidos
  var sonidoVoltear = new Howl({
    src: ["/assets/sounds/flip2.mp3"],
    volume: 0.6,
  });
  var sonidoGanar = new Howl({
    src: ["./assets/sounds/wingame.mp3"],
    volume: 0.7,
  });
  var sonidoPerder = new Howl({
    src: ["./assets/sounds/losegame.mp3"],
    volume: 0.7,
  });
  var sonidoCuentaAtras = new Howl({
    src: ["/assets/sounds/reloj.mp3"],
    loop: true,
    volume: 0.3,
  });

  // Inicia el juego al hacer clic en el botón de "Comenzar"
  botonInicio.addEventListener("click", iniciarJuego);

  function iniciarJuego() {
    // Obtener el nombre del jugador
    const nameInput = document.getElementById("player-name");
    playerName = nameInput.value;
    // Guardar el nombre del jugador en localStorage
    localStorage.setItem("playerName", playerName);
    // Configurar el contenedor del juego
    gsap.to(pantallaInicio, {
      duration: 0.5,
      opacity: 0,
      scale: 0.8,
      ease: "power2.inOut",
      onComplete: function () {
        pantallaInicio.style.display = "none";
        // Configuramos el contenedor del juego
        contenedorJuego.className = "";
        contenedorJuego.classList.add(
          "game-container",
          "grid",
          "grid-cols-3", // 3 columnas por defecto (móviles)
          "md:grid-cols-4", // 4 columnas en pantallas medianas en adelante
          "gap-4",
          "p-6",
          "bg-gray-800",
          "rounded-lg",
          "shadow-lg",
          "max-w-xl",
          "w-full"
        );
        // Aseguramos que el contenedor sea visible y animamos su aparición
        contenedorJuego.style.display = "grid";
        gsap.from(contenedorJuego, {
          duration: 0.5,
          opacity: 0,
          scale: 0.8,
          ease: "power2.out",
        });
        reiniciarJuego();
        crearTablero();
      },
    });
  }

  function reiniciarJuego() {
    clearInterval(intervaloTiempo);
    sonidoCuentaAtras.stop();
    cartasAbiertas = [];
    parejasEncontradas = 0;
    tiempoRestante = 15;
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
      }, 330);
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

    var mensaje =
      "Escanea el código QR para seguirme en Instagram. Comparte el juego con tus amigos y familiares.";
    Swal.fire({
      title: ganado
        ? `¡Felicidades, <br> ${playerName}! 🥳`
        : `Has perdido, <br> ${playerName} 😔`,
      html:
        "<p class='text-lg mb-3'>" +
        mensaje +
        "</p><div id='qr-code-container'></div>" +
        "<button id='reiniciar' class='mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-700 transition-colors rounded-lg text-white font-semibold shadow-md focus:outline-none'>Jugar de nuevo</button>",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: function () {
        var contenedorModalQR =
          Swal.getHtmlContainer().querySelector("#qr-code-container");
        contenedorModalQR.appendChild(contenedorQR);
        contenedorQR.style.margin = "auto";
        contenedorQR.style.display = "block";
        contenedorQR.style.marginLeft = "auto";
        contenedorQR.style.marginRight = "auto";
        contenedorQR.style.backgroundColor = "#fff";
        contenedorQR.style.borderRadius = "10px";
        contenedorQR.style.cursor = "pointer";
        contenedorQR.style.transition = "all 0.5s ease-in-out";
        contenedorQR.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        contenedorQR.style.padding = "10px";
        contenedorQR.style.width = "150px";
        contenedorQR.style.height = "150px";
        contenedorQR.style.border = "none";
        contenedorQR.style.outline = "none";
        contenedorQR.addEventListener("click", function () {
          window.open(urlMiSitio, "_blank");
        });

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

  // Animar la entrada del splash screen
  gsap.from(pantallaInicio, {
    duration: 1,
    opacity: 0,
    ease: "power.inOut",
  });
});
