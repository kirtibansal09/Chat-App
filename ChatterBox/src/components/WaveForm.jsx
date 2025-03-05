import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js';
import AudioFile from "../assets/audio/file_example.mp3"

const WaveForm = () => {
    const {incoming} = props;
    const waveformRef = useRef(null);
    const [waversurfer, setWavesurfer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');

    useEffect(() => {
        if(waveformRef.current){
            const ws = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#3C50E0',
                progressColor: '#80CAEE',
                url: AudioFile, 
                
                renderFunction: (channels, ctx) => {
                    const { width, height } = ctx.canvas;
                    const scale = channels[0].length / width;
                    const step = 6;
          
                    ctx.translate(0, height / 2);
                    ctx.strokeStyle = ctx.fillStyle;
                    ctx.beginPath();
          
                    for (let i = 0; i < width; i += step * 2) {
                      const index = Math.floor(i * scale);
                      const value = Math.abs(channels[0][index]);
                      let x = i;
                      let y = value * height;
          
                      ctx.moveTo(x, 0);
                      ctx.lineTo(x, y);
                      ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, true);
                      ctx.lineTo(x + step, 0);
          
                      x = x + step;
                      y = -y;
                      ctx.moveTo(x, 0);
                      ctx.lineTo(x, y);
                      ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, false);
                      ctx.lineTo(x + step, 0);
                    }
          
                    ctx.stroke();
                    ctx.closePath();
                  },

            })

            setWavesurfer(ws);

            return () => {
                ws.destroy();
            }
        }
    }, [])

    const formatTime = (time) => {
        const minutes = Math.floor(time/60);
        const seconds = Math.floor(time%60);

        return `${minutes} : ${seconds<10 ? "0" : ""}${seconds}`
    }


    const handlePlayPause  = () => {
        if(waversurfer){
          if(isPlaying){
            waversurfer.pause();
          }
          else{
            waversurfer.play();
          }

          setIsPlaying(!isPlaying);
        }
    }

  return (
    <div>
      
    </div>
  )
}

export default WaveForm
