# ♠️ Blackjack & Card Counting Master

Una aplicación web moderna, interactiva y educativa diseñada para jugar al **Blackjack** con reglas reales de casino y entrenar el **Conteo de Cartas**, la **Estrategia Básica** y las famosas **Desviaciones Illustrious 18**.

---

## 🚀 Inicio Rápido

Para iniciar la aplicación en tu navegador:

```bash
cd /home/alex/Projects/blackjack-counter
./run.sh
```

O con npm:

```bash
npm run dev
```

Abre en tu navegador: **[http://localhost:5173/](http://localhost:5173/)**

---

## ✨ Características Principales

### 1. ♠️ Mesa de Blackjack en Vivo (Casino Play)
- **Fieltro de casino verde esmeralda** con diseño inmersivo y texturas de mesa real.
- **Reglas de casino configurables**:
  - Zapato (Shoe) de 1, 2, 4, 6 u 8 barajas con tarjeta de corte (cut card) y penetración realista.
  - Regla del crupier: **S17** (se planta en 17 suave) o **H17** (pide en 17 suave).
  - Pago por Blackjack: **3:2** (1.5x) o **6:5** (1.2x).
  - **Doblaje (Double Down)** en dos cartas cualesquiera.
  - **División de parejas (Split)** con manos independientes.
  - **Rendición tardía (Late Surrender)**.
  - **Apuesta de Seguro (Insurance)** cuando el crupier muestra As, con cálculo en vivo de valor esperado (+EV/-EV).
- Fichas táctiles ($5, $10, $25, $50, $100, $500) con clink realista.
- **Efectos de sonido sintetizados** con Web Audio API (cero dependencias externas de archivos de audio).
- **Celebración festiva con confeti** al lograr Blackjack o victorias importantes.

### 2. 🧠 HUD de Conteo de Cartas en Tiempo Real
- **Conteo Corriente (Running Count - RC)**.
- **Conteo Real (True Count - TC)** con divisor de barajas restantes en el zapato.
- **Modos de visualización del HUD**:
  - *Visible*: Muestra los números en vivo para aprender.
  - *Al pasar el cursor (Peek)*: Mantiene el conteo oculto hasta que pasas el ratón por encima.
  - *Oculto*: Modo entrenamiento mental estricto.
- **Insignias en las cartas**: Opción de mostrar etiquetas (+1, 0, -1) en las esquinas de cada carta repartida.
- **Asesor de Apuestas (Betting Spread & Kelly Ramp)**: Te aconseja cuántas unidades apostar según el True Count.
- **Recomendación en vivo de Estrategia Básica y Desviaciones**: Sugiere Pedir, Plantarse, Doblar, Dividir o Rendirse.
- **Alertas de Desviación Illustrious 18**: Te avisa cuando la concentración de cartas altas amerita desviarse de la jugada clásica (ej. tomar seguro con TC ≥ +3, o plantarse con 16 vs 10 con TC ≥ 0).

### 3. ⏱️ Entrenador Rápido de Conteo (Flashcards Speed Drill)
- Diseñado para aumentar la velocidad de procesamiento mental.
- Opciones de prueba: 10, 20, 30 cartas o Baraja Completa (52 cartas).
- **Modo Parejas (2 cartas a la vez)**: Entrena la técnica profesional de **cancelación de parejas** (ej. Rey [-1] + 5 [+1] = 0).
- Velocidades ajustables: 2.0s, 1.2s, 0.8s, 0.5s por pase, o modo manual con barra espaciadora.
- Test final con desglose carta por carta para revisar aciertos y fallos.

### 4. 🎯 Entrenador de Estrategia y Desviaciones
- Escenarios generados al azar frente a la carta descubierta del crupier.
- Incluye simulaciones con situaciones específicas de **True Count** para dominar las 18 Ilustres.
- Feedback inmediato con explicación matemática de cada jugada.

### 5. 📊 Tablas de Estrategia y Desviaciones
- Matriz completa de Estrategia Básica codificada por colores:
  - Totales Duros (Hard)
  - Totales Suaves (Soft con As)
  - Pares (Splits)
- Tabla oficial de las **18 Ilustres (Illustrious 18)** con índice de activación, prioridad y explicación.

### 6. 📖 Guía Completa de Conteo
- Explicación de por qué funciona el conteo matemático sin mitos de Hollywood.
- Cómo convertir Running Count a True Count.
- Técnica de cancelación de parejas.
- Sistemas soportados:
  1. **Hi-Lo** (El estándar equilibrado más jugado en el mundo).
  2. **K-O (Knock-Out)** (Desbalanceado, sin necesidad de calcular True Count).
  3. **Omega II** (Multinivel de alta precisión con valores +2 y -2).
  4. **Red 7** (Variante desbalanceada donde los 7 rojos valen +1).

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Web Audio API**
- **Canvas Confetti**
- **LocalStorage API** (guarda automáticamente saldo, reglas y estadísticas de entrenamiento).
