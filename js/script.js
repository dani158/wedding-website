const weddingDate = new Date("August 22, 2026 16:00:00").getTime();

const elements = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const animateChange = (el, value) => {
  if (el.textContent !== value.toString()) {
    el.style.transform = "translateY(-6px)";
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = value;
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    }, 150);
  }
};

const updateCountdown = () => {
  const now = new Date().getTime();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById("countdown-wrapper").innerHTML = `
      <p style="font-size:1.4rem; margin-top:2rem;">
        Today is the day! 💍<br>
        <small>We can’t wait to celebrate with you.</small>
      </p>
    `;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  animateChange(elements.days, days);
  animateChange(elements.hours, hours);
  animateChange(elements.minutes, minutes);
  animateChange(elements.seconds, seconds);
};

updateCountdown();
setInterval(updateCountdown, 1000); // update every second
