import { useState, useRef, useEffect } from "react";

function App() {
  const [level, setLevel] = useState(1);
  const [hghLevel, setHghLevel] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isCritWaiting, setIsCritWaiting] = useState(false);

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
    if (animating || isWaiting || isCritWaiting) return;
    
    setIsWaiting(true);
    setAnimating(true);
    setResult(null);

    setTimeout(() => {
      setIsWaiting(false);
      const maxLevel = 14;
      const successRate = Math.max(1 - (level-1) * 0.07, 0.02);
      const success = Math.random() < successRate;

      const target = success && level < maxLevel ? level + 1 : 1;
      setAnimating(true);
      setResult(success ? 'success' : 'fail');

      setTimeout(() => {
        setLevel(target);
      }, anim_duration / 1.8);

      if (success && level < maxLevel) {
        setLevel(prev => prev + 1);
        const canvas = canvasRef.current;
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const colors = ["#ff4848ff", "#48adffff", "#9a48ffff", "#9aff48ff"];
        const lvlColor = colors[Math.floor(Math.random() * colors.length)];
        const crtColor = colors[2]
        for (let i = 0; i < level * 50; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * level + 2;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          const color = lvlColor
          particlesRef.current.push(new Particle(x, y, vx, vy, color));
        }
        if (Math.random() < 0.05) {
          setTimeout(() => {
            setResult(null);
            setIsCritWaiting(true);
            setTimeout(() => {
              setIsCritWaiting(false);
              const jump = Math.random() < 0.5 ? 2 : 1;
              setLevel(prev => prev + jump);
              setResult('critical');
              for (let i = 0; i < level * 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * level + 5;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const color = crtColor
                particlesRef.current.push(new Particle(x, y, vx, vy, color));
              }
              if (hghLevel < level) setHghLevel(level);
              setTimeout(() => {
                setResult(null);
                setAnimating(false);
              }, 1000);
            }, 1200)
          }, 1500)
        } else {
          setTimeout(() => {
            setResult(null);
            setAnimating(false);
          }, 1000)
        }
      } else {
        setResult('fail')
        if (hghLevel < level) setHghLevel(level);
        setLevel(1);
        setTimeout(() => {
          setAnimating(false);
          setResult(null);
        }, 1000);
      }
    }, 1500);
  }

  const currentRate = Math.max(1 - (level-1) * 0.07, 0.05); 

  return (
    <div className={`flex flex-col items-center justify-center w-screen h-screen transition-all`}>
      <div aria-hidden className={`absolute inset-0 pointer-events-none transition-colors duration-200 ${result === 'success' ? 'bg-blue-500/30' : result === 'fail' ? 'bg-red-500/30' : 'bg-transparent' }`}></div>
      <div className={`absolute inset-0 pointer-events-none transition-colors ${isWaiting ? 'bg-gray-900 duration-[1000ms]' : 'bg-transparent duration-0'}`}></div>
      {result && (
        <div className={`absolute inset-0 pointer-events-none animate-[flash_0.3s_ease-out]`}></div>
      )}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-1500 ${isCritWaiting ? 'bg-linear-to-r from-purple-900 via-purple-600 to-purple-900' : 'bg-transparent duration-0'}`} />
      <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full pointer-events-none'></canvas>
      <h1 className="text-4xl font-bold mb-6">강화 시스템</h1>
      <div className="text-3xl mb-4">현재 레벨</div>
      <div 
        className="text-3xl mb-4" 
        style={{
          animation: (isWaiting || isCritWaiting) ? 'shake 0.1s infinite' : 'none', 
          fontSize: isWaiting ? '160px' : (isCritWaiting ? '250px ': '60px'),  lineHeight: '1',  
          transition: isCritWaiting ? 'all 1200ms cubic-bezier(0, 0, 0, 1)' : `all ${isWaiting ? '1500ms ease-in-out' : `${result === 'fail' ? '1000ms ease-out' : '200ms ease-in-out'}`}`, 
          textShadow: isCritWaiting ? '0 0 50px #ffffffff' : isWaiting ? `0 0 50px #FFD700` : 'none', 
          color: isWaiting ? '#FFD700' : '#ffffff'
        }}
      >
        {level}
      </div>
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