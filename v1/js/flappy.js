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

function criarBarreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new parDeBarreiras(altura, abertura, largura),
    new parDeBarreiras(altura, abertura, largura + espaco),
    new parDeBarreiras(altura, abertura, largura + espaco * 2),
    new parDeBarreiras(altura, abertura, largura + espaco * 3),
    new parDeBarreiras(altura, abertura, largura + espaco * 4),
  ];

  const deslocamento = 3;
  this.animar = () => {
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

const alturaEmPixels = (86 / 100) * window.innerHeight;
const larguraEmPixels = (96 / 100) * window.innerWidth;
const barreiras = new criarBarreiras(alturaEmPixels, larguraEmPixels, 200, 400);
const areaDoJogo = document.querySelector("[flappy]");
barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));
setInterval(() => {
  barreiras.animar();
}, 20);
