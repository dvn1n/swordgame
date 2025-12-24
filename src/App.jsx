import { useState, useRef, useEffect } from "react";

function App() {
  const [level, setLevel] = useState(0);
  const [tryCount, setTryCount] = useState(3);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isCritWaiting, setIsCritWaiting] = useState(false);
  const [showAlert, setShowAlert] = useState(null);
  const [showCong, setShowCong] = useState(null);

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
      const maxLevel = 15;
      let successRate;
      if (level <= 10) {
        successRate = 1 - (level) * 0.05;
      } else {
        successRate = 0.5 - (level - 10) * 0.1;
      }
      const success = Math.random() < successRate;

      setAnimating(true);
      setResult(success ? 'success' : 'fail');

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
        setLevel(0);
        setTryCount(prev => prev - 1);
        setTimeout(() => {
          setAnimating(false);
          setResult(null);
        }, 1000);
      }
    }, 1500);
  }

  function handleAlert() {
    if (level === 0 || animating) return;
    if (level < 5) {
      setShowAlert('init');
    } else if (level < 10) {
      setShowAlert('sec');
    } else {
      setShowAlert('last');
    }
  }

  function handleGet() {
    if (level === 15) {
      setShowCong('last');
      setShowAlert(null)
    } else if (10 <= level && level < 15) {
      setShowCong('sec');
      setShowAlert(null)
    } else if (5 <= level && level < 10) {
      setShowCong('init');
      setShowAlert(null)
    }
    setLevel(0);
  }

  let currentRate;
    if (level <= 10) {
      currentRate = 1 - (level) * 0.05;
    } else {
      currentRate = 0.5 - (level - 10) * 0.1;
    }

  return (
    <div className={`flex flex-col items-center justify-center w-screen h-screen transition-all overflow-hidden animate-gradient`}>
      <div aria-hidden className={`absolute inset-0 pointer-events-none transition-colors duration-200 ${result === 'success' ? 'bg-blue-500/30' : result === 'fail' ? 'bg-red-500/30' : 'bg-transparent' }`}></div>
      <div className={`absolute inset-0 pointer-events-none transition-colors ${isWaiting ? 'bg-gray-900 duration-[1000ms]' : 'bg-transparent duration-0'}`}></div>
      {result && (
        <div className={`absolute inset-0 pointer-events-none animate-[flash_0.3s_ease-out]`}></div>
      )}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-1500 ${isCritWaiting ? 'bg-[linear-gradient(to_right,#2d83ecff,#1a7ec5ff)] duration-[1000ms]' : 'bg-transparent duration-0'}`} />
      <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full pointer-events-none'></canvas>
      <h1 className="text-white text-7xl font-bold mb-6">강화 확률 게임</h1>
      <div className="text-white text-3xl mb-4">현재 레벨</div>
      <div 
        className="text-white text-3xl mb-4" 
        style={{
          animation: (isWaiting || isCritWaiting) ? 'shake 0.1s infinite' : 'none', 
          fontSize: isWaiting ? '160px' : (isCritWaiting ? '250px ': '60px'),  lineHeight: '1',  
          transition: isCritWaiting ? 'all 1200ms cubic-bezier(0, 0, 0, 1)' : `all ${isWaiting ? '1500ms ease-in-out' : `${result === 'fail' ? '1000ms ease-out' : '200ms ease-in-out'}`}`, 
          textShadow: isCritWaiting ? '0 0 50px #ffffffff' : isWaiting ? `0 0 50px #FFD700` : 'none', 
          color: (isCritWaiting || isWaiting) ? '#FFD700' : ''
        }}
      >
        {level}
      </div>
      <div className='text-white text-3xl mb-4'>성공 확률: {(currentRate * 100).toFixed(1)}%</div>
      <div className='text-white text-3xl mb-4'>남은 횟수: {tryCount}번</div>
      <button
        onClick={enhance}
        className="bg-blue-500 text-white mb-4 px-6 py-3 rounded-lg hover:bg-blue-600 transition active:scale-95"
      >
        강화 시도
      </button>
      <button
        onClick={handleAlert}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition active:scale-95"
      >
        수령하기
      </button>
      {showAlert && (
      <div className="fixed inset-0 z-[500] flex items-center justify-center">
        <div className={`absolute inset-0 items-center justify-center flex flex-col bg-slate-900 animate-bg-fade`}></div>
        <div className={`relative z-[510] items-center w-[90%] justify-center bg-purple-500 max-w-md p-10 w-full min-w-[1000px] min-h-[500px] rounded-3xl shadow-[0_0_50px_#783dbcff] flex flex-col animate-box-popup`}>
          <div className="mb-4 text-center">
            <h2 className="text-white text-4xl font-black tracking-tight border-b-2 border-white/30 pb-2 whitespace-nowrap">
              {showAlert === 'init' && '아무것도 안 받겠다고요..?'}
              {showAlert === 'sec' && '페레로 로쉐 한개로 만족하는 거에요?'}
              {showAlert === 'last' && `${15 - level}번만 더 성공하면 키보드인데..`}
            </h2>
          </div>
          {showAlert === 'init' && (
             <img src='/no.png' alt="no" className="w-48 h-48 mb-4 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"></img>
          )}
          {showAlert === 'sec' && (
             <img src='/sec.webp' alt="sec" className="w-48 h-48 mb-4 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"></img>
          )}
          {showAlert === 'last' && (
             <img src='/last.png' alt="last" className="w-48 h-48 mb-4 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"></img>
          )}
          <div className="mb-8 text-center">
            <p className="text-white text-xl font-bold leading-relaxed break-keep">
              {showAlert === 'init' && '아무것도 안 받을 수는 없어요. 5레벨까지 화이팅!'}
              {showAlert === 'sec' && '설마.. 만족하는 건 아니겠죠..? 신중하게 선택하세요..'}
              {showAlert === 'last' && '고지까지 얼마 안남았어요. 화이팅!'}
            </p>
          </div>
          <div className="flex gap-4 w-full">
            <button onClick={() => setShowAlert(null)} className="flex-[2] bg-blue-400 text-purple-900 py-4 rounded-2xl text-2xl font-black hover:bg-blue-300 transition active:scale-95 shadow-lg">더 도전하기!</button>
            {level >= 5 && (
              <button onClick={() => handleGet()} className="flex-[2] bg-blue-400 text-purple-900 py-4 rounded-2xl text-2xl font-black hover:bg-blue-300 transition active:scale-95 shadow-lg">포기하고 보상 받기</button>
            )}
          </div>
        </div>
      </div>
      )}
      {showCong && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
          <div className={`absolute inset-0 items-center justify-center flex flex-col bg-slate-900 animate-bg-fade`}></div>
          <div className={`relative z-[510] items-center w-[90%] justify-center bg-blue-500 max-w-md p-10 w-full min-w-[1000px] min-h-[500px] rounded-3xl shadow-[0_0_50px_#4276c9ff] flex flex-col animate-box-popup`}>
            <div className="mb-4 text-center">
              <h2 className="text-white text-4xl font-black tracking-tight border-b-2 border-white/30 pb-2 whitespace-nowrap">
              {showCong === 'init' && '페레로 로쉐 한개 축하해요!'}
              {showCong === 'sec' && '페레로 로쉐 두개 축하해요!'}
              {showCong === 'last' && `키보드를 받아가시다니.. 축하해요!`}
              </h2>
            </div>
            {showCong === 'init' && (
             <img src='/roch.png' alt="one" className="w-80 h-80 mb-4 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"></img>
            )}
            {showCong === 'sec' && (
             <img src='/ruch.png' alt="two" className="w-80 h-80 mb-4 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"></img>
            )}
            {showCong === 'last' && (
             <img src='/key.png' alt="fin" className="w-80 h-80 mb-4 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"></img>
            )}
            <div className="mb-8 text-center">
              <p className="text-white text-xl font-bold leading-relaxed break-keep">
                {showCong === 'init' && '뭐 조금만 더 했으면 더 좋은 보상이었겠지만..'}
                {showCong === 'sec' && '조금만 더 했으면 키보드였는데.. 아쉬운거죠!'}
                {showCong === 'last' && `0.007%를 뚫으시고 키보드를 받으셨네요!`}
              </p>
            </div>
          </div>
        </div>
      )}
      {tryCount === 0 && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
          <div className={`absolute inset-0 items-center justify-center flex flex-col bg-slate-900 animate-bg-fade`}></div>
          <div className={`relative z-[510] items-center w-[90%] justify-center bg-red-500 max-w-md p-10 w-full min-w-[1000px] min-h-[500px] rounded-3xl shadow-[0_0_50px_#f03b3bff] flex flex-col animate-box-popup`}>
            <div className="mb-4 text-center">
              <h2 className="text-white text-6xl font-black tracking-tight border-b-2 border-white pb-2 whitespace-nowrap">게임 오버!</h2>
            </div>
            <img src='/fin.png' alt="bye" className="w-48 h-48 mb-4 object-contain drop-shadow-[0_0_50px_rgba(241, 39, 39, 0.87)]"></img>
            <div className="mb-8 text-center">
              <p className='text-white text-3xl font-bold leading-relaxed break-keep'>세번의 기회를 다 날리셨네요.. 아쉽지만 여기까지!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;