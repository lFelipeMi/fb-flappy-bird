let jogoPausado = false;

window.addEventListener("resize", () => {
  jogoPausado = true;
  alert("A página deve ser recarregada após redimensionar a tela.");
  location.reload();
});

function novoElemento(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function criarBarreira(reversa = false) {
  this.elemento = novoElemento("div", "barreira");

  const borda = novoElemento("div", "borda");
  const corpo = novoElemento("div", "corpo");
  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  this.setAltura = (altura) => (corpo.style.height = `${altura}px`);
}

/* const b = new Barreira(true);
b.setAltura(200);
document.querySelector("[flappy]").appendChild(b.elemento);
 */

function parDeBarreiras(altura, abertura, x) {
  this.elemento = novoElemento("div", "par-de-barreiras");

  this.superior = new criarBarreira(true);
  this.inferior = new criarBarreira(false);

  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura);
    const alturaInferior = altura - abertura - alturaSuperior;
    this.superior.setAltura(alturaSuperior);
    this.inferior.setAltura(alturaInferior);
  };

  // "100px" = ["100", "px"] = "100" = 100
  this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
  this.setX = (x) => (this.elemento.style.left = `${x}px`);
  this.getLargura = () => this.elemento.clientWidth;

  this.sortearAbertura();
  this.setX(x);
}

/*
const alturaEmPixels = (86 / 100) * window.innerHeight;
const b = new parDeBarreiras(alturaEmPixels, 200, 400);
document.querySelector("[flappy]").appendChild(b.elemento);
*/

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new parDeBarreiras(altura, abertura, largura),
    new parDeBarreiras(altura, abertura, largura + espaco),
    new parDeBarreiras(altura, abertura, largura + espaco * 2),
    new parDeBarreiras(altura, abertura, largura + espaco * 3),
    new parDeBarreiras(altura, abertura, largura + espaco * 4),
  ];

  const deslocamento = 3;
  this.animar = () => {
    if (jogoPausado) return;

    this.pares.forEach((par) => {
      par.setX(par.getX() - deslocamento);

      // quando a barreira sair da área do jogo
      if (par.getX() < -par.getLargura()) {
        const maxX = Math.max(...this.pares.map((p) => p.getX()));
        par.setX(maxX + espaco);
        par.sortearAbertura();
      }

      const meio = largura / 2;
      const cruzouOMeio =
        par.getX() + deslocamento >= meio && par.getX() < meio;
      if (cruzouOMeio) notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  let voando = false;
  /* let podeVoar = true; */

  this.elemento = novoElemento("img", "passaro");
  this.elemento.src = "midia/passaro.png";

  this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

  window.onkeydown = (e) => (voando = true);
  window.onkeyup = (e) => (voando = false);

  /*
  window.onkeydown = (e) => {
    if ((e.code === "Space" || e.key === "ArrowUp") && podeVoar) {
      voando = true;
      podeVoar = false;
    }
  };

  window.onkeyup = (e) => {
    if (e.code === "Space" || e.key === "ArrowUp") {
      voando = false;
      podeVoar = true;
    }
  };*/

  this.animarP = () => {
    const novoY = this.getY() + (voando ? 9 : -8);
    const alturaMaxima = alturaJogo - this.elemento.clientHeight;

    if (novoY <= 0) {
      this.setY(0);
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima);
    } else {
      this.setY(novoY);
    }
  };

  this.setY(alturaJogo / 2);
}

function Progesso() {
  this.elemento = novoElemento("span", "progresso");
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };

  this.atualizarPontos(0);
}
/*
const barreiras = new Barreiras(alturaEmPixels, larguraEmPixels, 200, 400);
const passaro = new Passaro(alturaEmPixels);
const areaDoJogo = document.querySelector("[flappy]");

areaDoJogo.appendChild(passaro.elemento);
areaDoJogo.appendChild(new Progesso().elemento);
barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));
setInterval(() => {
  barreiras.animar();
  passaro.animarP();
}, 20);
*/
function analizarColizao(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  let colidiu = false;
  barreiras.pares.forEach((parDeBarreiras) => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento;
      const inferior = parDeBarreiras.inferior.elemento;

      colidiu =
        analizarColizao(passaro.elemento, superior) ||
        analizarColizao(passaro.elemento, inferior);
    }
  });

  return colidiu;
}

function FlappyBird() {
  let pontos = 0;

  const areaDoJogo = document.querySelector("[flappy]");
  const altura = areaDoJogo.clientHeight;
  const largura = areaDoJogo.clientWidth;

  const progresso = new Progesso();
  const barreiras = new Barreiras(altura, largura, 200, 400, () =>
    progresso.atualizarPontos(++pontos)
  );
  const passaro = new Passaro(altura);

  areaDoJogo.appendChild(progresso.elemento);
  areaDoJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

  this.start = () => {
    const temporizador = setInterval(() => {
      barreiras.animar();
      passaro.animarP();

      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
      }
    }, 20);
  };
}

new FlappyBird().start();
