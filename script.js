function updateClock() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours();

    const secDeg = sec * 6;
    const minDeg = min * 6 + sec * 0.1;
    const hrDeg = ((hr % 12) * 30) + (min * 0.5);

    document.getElementById('second').style.transform = `translate(-50%, 0) rotate(${secDeg}deg)`;
    document.getElementById('minute').style.transform = `translate(-50%, 0) rotate(${minDeg}deg)`;
    document.getElementById('hour').style.transform = `translate(-50%, 0) rotate(${hrDeg}deg)`;
    
    document.getElementById('clock').classList.remove('noshow');
}

setInterval(updateClock, 1000);
updateClock();
