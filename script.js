const piezas = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
};

const piezasIniciales = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let tablero = JSON.parse(JSON.stringify(piezasIniciales));
let turnoBlanco = true;
let seleccion = null;
let juegoTerminado = false;

const tableroDiv = document.getElementById('tablero');
const turnoTexto = document.getElementById('turno');
const mensajeDiv = document.getElementById('mensaje');

function mostrarMensaje(texto, duracion = 3000) {
    mensajeDiv.textContent = texto;
    mensajeDiv.classList.add('mostrar');
    setTimeout(() => mensajeDiv.classList.remove('mostrar'), duracion);
}

function esBlanca(pieza) {
    return pieza === pieza.toUpperCase();
}

function dibujarTablero() {
    tableroDiv.innerHTML = '';
    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            const celda = document.createElement('div');
            celda.className = `celda ${(f + c) % 2 === 0 ? 'blanco' : 'negro'}`;
            celda.textContent = tablero[f][c] ? piezas[tablero[f][c]] : '';
            celda.dataset.fila = f;
            celda.dataset.col = c;

            if (seleccion && seleccion[0] === f && seleccion[1] === c) {
                celda.classList.add('seleccionada');
            }

            celda.onclick = () => manejarClick(f, c);
            tableroDiv.appendChild(celda);
        }
    }

    if (!juegoTerminado) {
        turnoTexto.textContent = turnoBlanco ? "Turno de las Blancas" : "Turno de las Negras";
    }
}

function manejarClick(f, c) {
    if (juegoTerminado) return;

    const pieza = tablero[f][c];

    if (seleccion) {
        const [fO, cO] = seleccion;
        const piezaOrigen = tablero[fO][cO];

        if (f === fO && c === cO) {
            seleccion = null;
        } else if (movimientoLegal(fO, cO, f, c)) {
            tablero[f][c] = piezaOrigen;
            tablero[fO][cO] = '';
            seleccion = null;

            // Promoción automática
            if (piezaOrigen.toLowerCase() === 'p' && (f === 0 || f === 7)) {
                tablero[f][c] = turnoBlanco ? 'Q' : 'q';
                mostrarMensaje("¡Peón promocionado a dama!");
            }

            turnoBlanco = !turnoBlanco;

            if (estaEnJaque(turnoBlanco)) {
                if (!hayMovimientosLegales(turnoBlanco)) {
                    mostrarMensaje(`¡Jaque mate! Ganan las ${turnoBlanco ? "Negras" : "Blancas"}`);
                    juegoTerminado = true;
                    mostrarBotonReiniciar();
                } else {
                    mostrarMensaje("¡Jaque!");
                }
            }
        } else {
            mostrarMensaje("Movimiento no permitido");
            seleccion = null;
        }
    } else {
        if (pieza !== '' && ((turnoBlanco && esBlanca(pieza)) || (!turnoBlanco && !esBlanca(pieza)))) {
            seleccion = [f, c];
        } else if (pieza !== '') {
            mostrarMensaje("No puedes mover piezas del oponente");
        }
    }

    dibujarTablero();
}

function encontrarRey(blanco) {
    const rey = blanco ? 'K' : 'k';
    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            if (tablero[f][c] === rey) return [f, c];
        }
    }
    return null;
}

function estaEnJaque(blanco) {
    const [reyF, reyC] = encontrarRey(blanco);
    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            const pieza = tablero[f][c];
            if (pieza && esBlanca(pieza) !== blanco) {
                if (movimientoLegal(f, c, reyF, reyC, true)) return true;
            }
        }
    }
    return false;
}

function hayMovimientosLegales(blanco) {
    for (let fO = 0; fO < 8; fO++) {
        for (let cO = 0; cO < 8; cO++) {
            const pieza = tablero[fO][cO];
            if (pieza && esBlanca(pieza) === blanco) {
                for (let fD = 0; fD < 8; fD++) {
                    for (let cD = 0; cD < 8; cD++) {
                        if (movimientoLegal(fO, cO, fD, cD)) {
                            const copia = JSON.parse(JSON.stringify(tablero));
                            copia[fD][cD] = pieza;
                            copia[fO][cO] = '';
                            if (pieza.toLowerCase() === 'p' && (fD === 0 || fD === 7)) {
                                copia[fD][cD] = blanco ? 'Q' : 'q';
                            }
                            if (!estaEnJaqueConTablero(blanco, copia)) return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function estaEnJaqueConTablero(blanco, tableroSimulado) {
    const rey = blanco ? 'K' : 'k';
    let reyF = -1, reyC = -1;
    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            if (tableroSimulado[f][c] === rey) {
                reyF = f;
                reyC = c;
            }
        }
    }
    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            const pieza = tableroSimulado[f][c];
            if (pieza && esBlanca(pieza) !== blanco) {
                if (movimientoLegalConTablero(f, c, reyF, reyC, tableroSimulado, true)) return true;
            }
        }
    }
    return false;
}

function movimientoLegal(fO, cO, fD, cD, ignorarTurno = false) {
    return movimientoLegalConTablero(fO, cO, fD, cD, tablero, ignorarTurno);
}

function movimientoLegalConTablero(fO, cO, fD, cD, t, ignorarTurno = false) {
    const pieza = t[fO][cO];
    const destino = t[fD][cD];
    if (!pieza) return false;
    if (!ignorarTurno && ((turnoBlanco && !esBlanca(pieza)) || (!turnoBlanco && esBlanca(pieza)))) return false;
    if (destino && esBlanca(destino) === esBlanca(pieza)) return false;

    const deltaF = fD - fO, deltaC = cD - cO;
    const absF = Math.abs(deltaF), absC = Math.abs(deltaC);
    const pasoF = deltaF === 0 ? 0 : deltaF / absF;
    const pasoC = deltaC === 0 ? 0 : deltaC / absC;

    function libre() {
        let f = fO + pasoF, c = cO + pasoC;
        while (f !== fD || c !== cD) {
            if (t[f][c] !== '') return false;
            f += pasoF;
            c += pasoC;
        }
        return true;
    }

    switch (pieza.toLowerCase()) {
        case 'p': {
            const dir = esBlanca(pieza) ? -1 : 1;
            const inicio = esBlanca(pieza) ? 6 : 1;
            if (cD === cO && t[fD][cD] === '') {
                if (fD === fO + dir) return true;
                if (fO === inicio && fD === fO + 2 * dir && t[fO + dir][cO] === '') return true;
            }
            if (absC === 1 && fD === fO + dir && t[fD][cD] !== '' && esBlanca(t[fD][cD]) !== esBlanca(pieza)) {
                return true;
            }
            return false;
        }
        case 'r': return (deltaF === 0 || deltaC === 0) && libre();
        case 'b': return absF === absC && libre();
        case 'q': return (deltaF === 0 || deltaC === 0 || absF === absC) && libre();
        case 'n': return (absF === 2 && absC === 1) || (absF === 1 && absC === 2);
        case 'k': return absF <= 1 && absC <= 1;
        default: return false;
    }
}


dibujarTablero();

const reiniciarBtn = document.getElementById('reiniciar');

function mostrarBotonReiniciar() {
  reiniciarBtn.classList.remove('boton-oculto');
}

function ocultarBotonReiniciar() {
  reiniciarBtn.classList.add('boton-oculto');
}

reiniciarBtn.onclick = () => {
  tablero = JSON.parse(JSON.stringify(piezasIniciales));
  turnoBlanco = true;
  seleccion = null;
  ocultarBotonReiniciar();
  dibujarTablero();
  mostrarMensaje("¡Nueva partida!");
};
