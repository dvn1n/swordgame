import { useState, useRef, useEffect } from "react";

function App() {
  const [level, setLevel] = useState(1);
  const [hghLevel, setHghLevel] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState(null);
  const [prevNum, setPrevNum] = useState(1);
  const [nextNum, setNextNum] = useState(1);
  const [translateY, setTranslateY] = useState('0%');
  const [transSize, setTransSize] = useState('1')
  const anim_duration = 500;
  const bg_hold = 600;
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  class Particle {
    constructor(x, y, vx, vy, color) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.alpha = 1;
      this.size = Math.random() * 3 + 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05;
      this.alpha -= 0.01;
    }
    draw(ctx) {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particlesRef.current.splice(i, 1);
      });
      
      requestAnimationFrame(animate);
    };
    animate(); 
  }, [])

  function enhance() {
    if (animating) return;

    const maxLevel = 10;
    const successRate = Math.max(1 - (level-1) * 0.1, 0.05);
    const success = Math.random() < successRate;

    const target = success && level < maxLevel ? level + 1 : 1;
    setPrevNum(level);
    setNextNum(target);
    setAnimating(true);
    setResult(success ? 'success' : 'fail');
    setTranslateY('0%');
    setTransSize('1');

    setTimeout(() => {
      setTranslateY('-50%');
      setTransSize('2')
    }, 20);

    setTimeout(() => {
      setLevel(target);
    }, anim_duration / 1.8);

    setTimeout(() => {
      setTranslateY('0%');
      setTransSize('1');
      setResult(null);
      setAnimating(false);
      setPrevNum(target);
      setNextNum(target);
    }, anim_duration);

    if (success && level < maxLevel) {
      setLevel(level + 1);
      const canvas = canvasRef.current;
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      const colors = ["#ff4848ff", "#48adffff", "#9a48ffff", "#9aff48ff"];
      const lvlColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < level * 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * level + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = lvlColor
        particlesRef.current.push(new Particle(x, y, vx, vy, color));
      }
    }
    else {
      if (hghLevel < level) setHghLevel(level);
      setLevel(1);
    }
  }

  const currentRate = Math.max(1 - (level-1) * 0.1, 0.05);
  const slotHeight = 48;
  const translateStyle = {transform: `translateY(${translateY})`, transition: animating ? `transform ${anim_duration}ms cubic-bezier(.2,.9,.2,1)` : 'none'};
  const fontTranslateStyle = {fontSize: `${32 * transSize}px`, transition: `font-size ${anim_duration}ms`}

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <div aria-hidden className={`absolute inset-0 pointer-events-none transition-colors duration-200 ${result === 'success' ? 'bg-blue-500/30' : result === 'fail' ? 'bg-red-500/30' : 'bg-transparant' }`}></div>
      <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full pointer-events-none'></canvas>
      <h1 className="text-4xl font-bold mb-6">강화 시스템</h1>
      <div className='relative h-12 overflow-hidden text-4xl mb-4' style={{width : `${100 * transSize}px`, height : `${slotHeight * transSize}px`, transition: `width ${anim_duration}ms height ${anim_duration}ms`, display: 'flex', justifyContent: 'center'}}>
        <div style={translateStyle}>
          <div style={fontTranslateStyle}>{prevNum}</div>
          <div style={fontTranslateStyle}>{nextNum}</div>
        </div>
      </div>
      <div className="text-3xl mb-4">현재 레벨: {level}</div>
      <div className='text-3xl mb-4'>성공 확률: {(currentRate * 100).toFixed(1)}%</div>
      <button
        onClick={enhance}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
      >
        강화 시도
      </button>
      <div className="text-3xl mt-4">최고 레벨: {hghLevel}</div>
    </div>
  );
}

export default App;