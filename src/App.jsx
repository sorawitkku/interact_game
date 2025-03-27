import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

const PlayerShip = ({ position }) => {
  return (
    <mesh position={position}>
      <coneGeometry args={[0.3, 1, 16]} />
      <meshStandardMaterial color="cyan" />
    </mesh>
  );
};

const Meteor = ({ index, position, color, updateMeteorPosition, onOutOfBounds }) => {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.position.z += 0.03;
      ref.current.rotation.y += 0.01;
      updateMeteorPosition(index, [
        ref.current.position.x,
        ref.current.position.y,
        ref.current.position.z,
        color
      ]);

      if (ref.current.position.z > 18) {
        onOutOfBounds(index);
      }
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.5, 5]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
    </mesh>
  );
};

const generateMeteor = () => ([
  (Math.random() - 0.5) * 20,
  (Math.random() - 0.5) * 10,
  (Math.random() - 0.5) * 50,
  Math.random() > 0.5 ? "red" : "orange"
]);

const generateMeteors = (count) => {
  return new Array(count).fill().map(() => generateMeteor());
};

const CameraController = ({ position, rotation, setScore, meteors, setMeteors }) => {
  useFrame((state) => {
    state.camera.position.set(...position);
    state.camera.rotation.set(...rotation);

    setMeteors((prevMeteors) => prevMeteors.map(([x, y, z, color], index) => {
      const distance = Math.sqrt(
        (position[0] - x) ** 2 +
        (position[1] - y) ** 2 +
        (position[2] - z) ** 2
      );
      if (distance < 1) {
        setScore((prevScore) => prevScore + (color === "red" ? 10 : -10));
        return generateMeteor();
      }
      return [x, y, z, color];
    }));
  });
  return null;
};

const App = () => {
  const [position, setPosition] = useState([0, 2, 10]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [meteors, setMeteors] = useState(generateMeteors(30));
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const speed = 0.3;
  const rotationSpeed = 0.05;

  useEffect(() => {
    const handleKeyDown = (event) => {
      setShowInstructions(false);
      setPosition((prev) => {
        let newPos = [...prev];
        if (event.key === "w") newPos[2] -= speed;
        if (event.key === "s") newPos[2] += speed;
        if (event.key === "a") newPos[0] -= speed;
        if (event.key === "d") newPos[0] += speed;
        if (event.key === "q") newPos[1] += speed;
        if (event.key === "e") newPos[1] -= speed;
        return newPos;
      });
      setRotation((prev) => {
        let newRot = [...prev];
        if (event.key === "ArrowLeft") newRot[1] += rotationSpeed;
        if (event.key === "ArrowRight") newRot[1] -= rotationSpeed;
        if (event.key === "ArrowUp") newRot[0] += rotationSpeed;
        if (event.key === "ArrowDown") newRot[0] -= rotationSpeed;
        return newRot;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateMeteorPosition = (index, newPosition) => {
    setMeteors((prev) => {
      const updated = [...prev];
      updated[index] = newPosition;
      return updated;
    });
  };

  const handleOutOfBounds = (index) => {
    setMeteors((prev) => {
      const updated = [...prev];
      updated[index] = generateMeteor();
      return updated;
    });
  };

  return (
    <>
      {showInstructions && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          zIndex: 20
        }}>
          <p><strong>Space Pilot Instructions</strong></p>
          <p><em>Press any key to start</em></p>
        </div>
      )}

      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        color: "white",
        fontSize: "24px",
        fontWeight: "bold",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 10
      }}>
        Score: {score}
      </div>

      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        color: "lime",
        fontSize: "16px",
        backgroundColor: "rgba(0, 255, 0, 0.1)",
        border: "1px solid lime",
        padding: "12px",
        borderRadius: "8px",
        fontFamily: "Orbitron, sans-serif",
        textShadow: "0 0 5px lime",
        zIndex: 10
      }}>
        <div><strong>Mission Briefing</strong></div>
        <div>▶ Eliminate red meteors</div>
        <div>▶ Avoid orange ones</div>
        <div>▶ Watch your altitude</div>
      </div>

      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        color: "lime",
        fontFamily: "Orbitron, sans-serif",
        textShadow: "0 0 5px lime",
        zIndex: 9
      }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "20px",
          height: "20px",
          marginLeft: "-10px",
          marginTop: "-10px",
          border: "2px solid lime",
          borderRadius: "50%",
          boxShadow: "0 0 5px lime"
        }} />

        <div style={{
          position: "absolute",
          bottom: "30px",
          left: "30px",
          background: "rgba(0, 255, 0, 0.1)",
          padding: "10px",
          border: "1px solid lime",
          borderRadius: "8px"
        }}>
          <div>Altitude: {position[1].toFixed(1)}</div>
        </div>

        <div style={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          background: "rgba(0, 255, 0, 0.1)",
          padding: "10px",
          border: "1px solid lime",
          borderRadius: "8px"
        }}>
          <div>Rotation X: {rotation[0].toFixed(2)}</div>
          <div>Rotation Y: {rotation[1].toFixed(2)}</div>
        </div>
      </div>
      <div style={{
  position: "absolute",
  top: "50%",
  left: "20px",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
  zIndex: 10
}}>
  <img
    src="/images/1.png"
    alt="Image 1"
    style={{
      width: "200px",
      height: "auto",
      borderRadius: "12px",
      boxShadow: "0 0 15px rgba(0, 255, 0, 0.5)"
    }}
  />
  <img
    src="/images/2.png"
    alt="Image 2"
    style={{
      width: "200px",
      height: "auto",
      borderRadius: "12px",
      boxShadow: "0 0 15px rgba(0, 255, 0, 0.5)"
    }}
  />
</div>
      <Canvas style={{ width: "100vw", height: "100vh", background: "black" }}>
        <CameraController position={position} rotation={rotation} setScore={setScore} meteors={meteors} setMeteors={setMeteors} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <PlayerShip position={position} />
        {meteors.map(([x, y, z, color], index) => (
          <Meteor
            key={index}
            index={index}
            position={[x, y, z]}
            color={color}
            updateMeteorPosition={updateMeteorPosition}
            onOutOfBounds={handleOutOfBounds}
          />
        ))}
      </Canvas>
    </>
  );
};

export default App;
