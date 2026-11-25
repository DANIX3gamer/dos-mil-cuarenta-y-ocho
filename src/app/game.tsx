import { Text, View, StyleSheet, Pressable, useWindowDimensions, Animated } from "react-native";
import { styles } from "../styles";
import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { PanResponder } from "react-native";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

// Componente de Celda Animada que se desliza a su nueva posición (row, col)
const AnimatedCell = ({ value, size, row, col }: { value: number; size: number; row: number; col: number }) => {
  const animX = useRef(new Animated.Value(col * size)).current;
  const animY = useRef(new Animated.Value(row * size)).current;
  const scaleAnim = useRef(new Animated.Value(value === 0 ? 0 : 1)).current;

  useEffect(() => {
    // Desliza la ficha suavemente a sus nuevas coordenadas (X, Y)
    Animated.parallel([
      Animated.timing(animX, {
        toValue: col * size,
        duration: 120, // Velocidad del deslizamiento en milisegundos
        useNativeDriver: true,
      }),
      Animated.timing(animY, {
        toValue: row * size,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [row, col, size]);

  useEffect(() => {
    if (value !== 0) {
      scaleAnim.setValue(0.8);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  if (value === 0) return null; // Si está vacía, no se renderiza para evitar sobrecargar

  const numberBgColor: Record<number, string> = {
    2: "#eee4da",
    4: "#ede0c8",
    8: "#f2b179",
    16: "#f59563",
    32: "#f67c5f",
    64: "#f65e3b",
    128: "#edcf72",
    256: "#edcc61",
    512: "#edc850",
    1024: "#edc53f",
    2048: "#edc22e",
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size - 4, // Pequeño margen estético entre fichas
        height: size - 4,
        margin: 2,
        backgroundColor: numberBgColor[value] || "#3c3a32",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        transform: [
          { translateX: animX },
          { translateY: animY },
          { scale: scaleAnim },
        ],
      }}
    >
      <Text style={[styles.buttonText, { fontSize: size * 0.35, textAlign: "center" }]}>
        {value}
      </Text>
    </Animated.View>
  );
};

export default function Game() {
  const { width } = useWindowDimensions();
  const N = 4;
  const boardsize = width * 0.7;
  const cellsize = boardsize / N;
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10000);
  
  const addRandomTile = (currentBoard: number[][]) => {
    let emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (currentBoard[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const [board, setBoard] = useState<number[][]>(() => {
    let initial = Array.from({ length: N }, () => Array(N).fill(0));
    initial = addRandomTile(initial);
    initial = addRandomTile(initial);
    return initial;
  });

  const combineLine = (line: number[]) => {
    let filtered = line.filter((val) => val !== 0);
    let newLine: number[] = [];
    let pointsEarned = 0;
    let i = 0;

    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        let mergedValue = filtered[i] * 2;
        newLine.push(mergedValue);
        pointsEarned += mergedValue;
        i += 2;
      } else {
        newLine.push(filtered[i]);
        i += 1;
      }
    }

    while (newLine.length < N) {
      newLine.push(0);
    }
    return { newLine, points: pointsEarned };
  };

  const moveLeft = (currentBoard: number[][]) => {
    let newBoard = currentBoard.map((row) => [...row]);
    let totalPoints = 0;
    for (let r = 0; r < N; r++) {
      let { newLine, points } = combineLine(newBoard[r]);
      newBoard[r] = newLine;
      totalPoints += points;
    }
    return { board: newBoard, points: totalPoints };
  };

  const moveRight = (currentBoard: number[][]) => {
    let newBoard = currentBoard.map((row) => [...row]);
    let totalPoints = 0;
    for (let r = 0; r < N; r++) {
      let reversed = [...newBoard[r]].reverse();
      let { newLine, points } = combineLine(reversed);
      newBoard[r] = newLine.reverse();
      totalPoints += points;
    }
    return { board: newBoard, points: totalPoints };
  };

  const moveUp = (currentBoard: number[][]) => {
    let newBoard = currentBoard.map((row) => [...row]);
    let totalPoints = 0;
    for (let c = 0; c < N; c++) {
      let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
      let { newLine, points } = combineLine(col);
      for (let r = 0; r < N; r++) {
        newBoard[r][c] = newLine[r];
      }
      totalPoints += points;
    }
    return { board: newBoard, points: totalPoints };
  };

  const moveDown = (currentBoard: number[][]) => {
    let newBoard = currentBoard.map((row) => [...row]);
    let totalPoints = 0;
    for (let c = 0; c < N; c++) {
      let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]].reverse();
      let { newLine, points } = combineLine(col);
      newLine.reverse();
      for (let r = 0; r < N; r++) {
        newBoard[r][c] = newLine[r];
      }
      totalPoints += points;
    }
    return { board: newBoard, points: totalPoints };
  };

  const checkGameOver = (currentBoard: number[][]) => {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (currentBoard[r][c] === 0) return false;
      }
    }
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const current = currentBoard[r][c];
        if (c + 1 < N && currentBoard[r][c + 1] === current) return false;
        if (r + 1 < N && currentBoard[r + 1][c] === current) return false;
      }
    }
    return true;
  };

  const panresponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const minSwipeDistance = 35;

        setBoard((prevBoard) => {
          let result;
          let moved = false;

          if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > minSwipeDistance) {
              if (dx < 0) result = moveLeft(prevBoard);
              else result = moveRight(prevBoard);
              moved = true;
            }
          } else {
            if (Math.abs(dy) > minSwipeDistance) {
              if (dy > 0) result = moveDown(prevBoard);
              else result = moveUp(prevBoard);
              moved = true;
            }
          }

          if (moved && result) {
            const boardChanged = JSON.stringify(prevBoard) !== JSON.stringify(result.board);
            if (boardChanged) {
              setScore((prev) => prev + result.points);
              const newBoard = addRandomTile(result.board);

              if (checkGameOver(newBoard)) {
                setTimeout(() => {
                  router.replace("/gameover");
                }, 100);
              }

              return newBoard;
            }
          }
          return prevBoard;
        });
      },
    })
  ).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => { clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      onGameOver();
    }
  }, [timer]);

  const onGameOver = () => {
    router.replace("/gameover");
  }
  
  const gamestyles = StyleSheet.create({
    board: {
      backgroundColor: "#bbada0",
      width: boardsize,
      height: boardsize,
      position: "relative", // Indispensable para que las fichas absolutas se posicionen dentro del tablero
      overflow: "hidden",
      borderRadius: 6,
    },
    backgroundGrid: {
      width: boardsize,
      height: boardsize,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    bgCell: {
      width: cellsize,
      height: cellsize,
      backgroundColor: "rgba(238, 228, 218, 0.35)",
      borderWidth: 4,
      borderColor: "#bbada0",
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.buttonText}>{formatTime(timer)}</Text>
      <Text style={styles.buttonText}>Puntuacion: {score}</Text>
      
      {/* Contenedor del Tablero */}
      <View style={gamestyles.board} {...panresponder.panHandlers}>
        {/* 1. Fondo estático del tablero (las casillas vacías de color base) */}
        <View style={gamestyles.backgroundGrid}>
          {Array.from({ length: N * N }).map((_, index) => (
            <View key={`bg-${index}`} style={gamestyles.bgCell} />
          ))}
        </View>

        {/* 2. Fichas animadas que se mueven por encima de las coordenadas */}
        {board.map((row, rowIndex) =>
          row.map((cellValue, colIndex) => (
            <AnimatedCell
              key={`tile-${rowIndex}-${colIndex}-${cellValue}`}
              row={rowIndex}
              col={colIndex}
              size={cellsize}
              value={cellValue}
            />
          ))
        )}
      </View>

      <Pressable style={styles.button} onPress={onGameOver}>
        <Text style={styles.buttonText}>Terminar Juego</Text>
      </Pressable>
    </View>
  );
}
