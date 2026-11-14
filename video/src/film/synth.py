"""Ambient felt-piano cue for the brand film. Pure numpy; output 48 kHz stereo WAV."""
import numpy as np, soundfile as sf, sys
SR=48000; DUR=float(sys.argv[1]) if len(sys.argv)>1 else 86.0
rng=np.random.default_rng(7)
t=np.arange(int(SR*DUR))/SR
def note(freq, start, length, vel=1.0, bright=1.0):
    n=int(SR*length); tt=np.arange(n)/SR
    env=np.exp(-tt*(2.2/ (0.6+length*0.25)))*(1-np.exp(-tt*120))      # fast attack, long decay
    partials=[(1,1.0),(2,0.42*bright),(3,0.18*bright),(4,0.08*bright),(5,0.04*bright)]
    y=sum(a*np.sin(2*np.pi*freq*k*tt+rng.uniform(0,6.28))*np.exp(-tt*k*0.9) for k,a in partials)
    y*=env*vel*0.22
    out=np.zeros_like(t); i0=int(start*SR); n=min(n,len(out)-i0)
    if n>0: out[i0:i0+n]+=y[:n]
    return out
A=lambda m: 440*2**((m-69)/12)
# progression (A minor pastoral): Am9 – Fmaj7 – Cmaj9 – G6, 8 s each, slow broken chords
chords=[[57,64,67,71,76],[53,60,64,69,72],[48,55,64,67,74],[55,59,62,67,71]]
mix=np.zeros_like(t)
bar=8.0; k=0
while k*bar<DUR:
    ch=chords[k%4]
    # bass
    mix+=note(A(ch[0]-12),k*bar,7.5,0.9,0.6)
    # broken chord, humanised
    order=[1,2,3,4,2,3,1,4]
    for j,idx in enumerate(order):
        st=k*bar+j*0.95+rng.uniform(-0.03,0.03)
        if st<DUR: mix+=note(A(ch[idx]),st,4.5,0.55+0.25*rng.random(),1.0)
    # occasional high sparkle
    if k%2==1: mix+=note(A(ch[4]+12),k*bar+3.1,5,0.35,1.2)
    k+=1
# pad: detuned sines following the chord root/fifth
pad=np.zeros_like(t)
for k2 in range(int(DUR/bar)+1):
    ch=chords[k2%4]; seg=(t>=k2*bar)&(t<(k2+1)*bar)
    env=np.clip((t-k2*bar)/2.5,0,1)*np.clip(((k2+1)*bar-t)/2.5,0,1)
    for m,a in [(ch[0],0.06),(ch[2],0.045),(ch[0]+12,0.03)]:
        f=A(m); pad+=seg*env*a*(np.sin(2*np.pi*f*t)+np.sin(2*np.pi*f*1.003*t)+0.5*np.sin(2*np.pi*f*0.5*t))
# simple reverb: convolve with exponentially decaying noise
ir=rng.standard_normal(int(SR*2.8))*np.exp(-np.arange(int(SR*2.8))/SR*1.6); ir/=np.sqrt((ir**2).sum())
def rev(x,wet=0.35):
    y=np.fft.irfft(np.fft.rfft(x,len(x)+len(ir))*np.fft.rfft(ir,len(x)+len(ir)))[:len(x)]
    return x*(1-wet)+y*wet*2.2
y=rev(mix,0.42)+rev(pad,0.3)
# master: gentle lowpass via moving average, fade in/out, normalise
k=int(SR*0.00008)+1
y=np.convolve(y,np.ones(k)/k,mode="same")
fade=np.minimum(1,t/3)*np.minimum(1,(DUR-t)/6)
y*=fade; y/=np.max(np.abs(y))+1e-9; y*=0.7
st=np.stack([y*0.98+np.roll(y,int(SR*0.012))*0.02, y*0.98+np.roll(y,int(SR*0.009))*0.02],1)
sf.write("brand_music.wav",st.astype(np.float32),SR); print("ok",DUR)
