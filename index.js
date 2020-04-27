// Не забудьте учесть хост, это для отладки на Android Chrome

initVideo(
    document.getElementById('video-1'),
    'http://192.168.0.106:9191/master?url=http%3A%2F%2F192.168.0.106%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8'
);

initVideo(
    document.getElementById('video-2'),
    'http://192.168.0.106:9191/live?url=http%3A%2F%2F192.168.0.106%3A3102%2Fstreams%2Fstairs%2Fmaster.m3u8'
);

initVideo(
    document.getElementById('video-3'),
    'http://192.168.0.106:9191/master?url=http%3A%2F%2F192.168.0.106%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8'
);

initVideo(
    document.getElementById('video-4'),
    'http://192.168.0.106:9191/live?url=http%3A%2F%2F192.168.0.106%3A3102%2Fstreams%2Fstreet%2Fmaster.m3u8'
);

// Часть про диаграмму

const audioCtx = new window.AudioContext();
const analyser = audioCtx.createAnalyser();

const source1 = audioCtx.createMediaElementSource(
    document.getElementById('video-1')
).connect(analyser);

const source2 = audioCtx.createMediaElementSource(
    document.getElementById('video-2')
).connect(analyser);

const source3 = audioCtx.createMediaElementSource(
    document.getElementById('video-3')
).connect(analyser);

const source4 = audioCtx.createMediaElementSource(
    document.getElementById('video-4')
).connect(analyser);

analyser.connect(audioCtx.destination);

analyser.fftSize = 1024;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

const canvas = document.getElementById("oscilloscope");
canvas.style.display = 'none';
const canvasCtx = document.getElementById("oscilloscope").getContext("2d");

function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(10, 20, 100)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(250, 250, 250)";

    canvasCtx.beginPath();

    var sliceWidth = canvas.width * 1.0 / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / 128.0;
        var y = v * canvas.height / 2;

        if (i === 0) {
        canvasCtx.moveTo(x, y);
        } else {
        canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

draw();    

// часть про раскрытие активного видео

const activeVideo = {
    active: false,
    activeRect: {
        top: null,
        left: null,
    },
    timeout: .4,
    activeId: null,
};

const popupBackground = document.querySelector('.popupBackground');
const closeButton = document.querySelector('.closeButton');

document.querySelectorAll('.video').forEach((el) => {

    el.addEventListener('click', () => {
        if (!activeVideo.active) {

            activeVideo.active = true;
            activeVideo.activeId = el.id;

            const rect = el.getBoundingClientRect();

            activeVideo.activeRect = {
                top: rect.y,
                left: rect.x,
            }

            el.style.top = rect.y;
            el.style.left = rect.x;
            el.style.position = 'fixed';

            closeButton.style.display = 'block';
            canvas.style.display = 'block';

            el.muted = false;

            audioCtx.resume();

            popupBackground.classList.add('popupBackground-active');
            el.classList.add('fullscreen');
        }
    });
    
});

closeButton.addEventListener('click', () => {
    activeVideo.active = false;
    closeButton.style.display = 'none';
    canvas.style.display = 'none';

    popupBackground.classList.remove('popupBackground-active');

    const video = document.getElementById(activeVideo.activeId);
    video.classList.remove('fullscreen');
    video.muted = true;

    audioCtx.suspend();

    setTimeout(() => {
        video.style.position = 'static';
    }, activeVideo.timeout * 1000)
});

// часть про фильтры

const brightness = document.getElementById('brightness');
const brightnessValue = document.getElementById('brightness-value');

const contrast = document.getElementById('contrast');
const contrastValue = document.getElementById('contrast-value');

function onChangeInput(elem, name, textElem) {
    elem.addEventListener('change', () => {
        textElem.innerText = elem.value;
        document.querySelectorAll('.video').forEach((el) => {
            el.style.webkitFilter = `${name}(${elem.value}%)`;
        });
    });
}

onChangeInput(brightness, 'brightness', brightnessValue);
onChangeInput(contrast, 'contrast', contrastValue);