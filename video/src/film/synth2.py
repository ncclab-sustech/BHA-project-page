"""Music cue for the brand film v2: felt piano bed + heartbeat pulse + risers/impacts on the flash cuts. Pure numpy, 48 kHz stereo."""
import numpy as np, soundfile as sf, sys
SR=48000; DUR=float(sys.argv[1]) if len(sys.argv)>1 else 86.0
rng=np.random.default_rng(7)
t=np.arange(int(SR*DUR))/SR
def place(out,y,start):
    i0=int(start*SR); n=min(len(y),len(out)-i0)
    if n>0 and i0>=0: out[i0:i0+n]+=y[:n]
def note(freq,length,vel=1.0,bright=1.0):
    n=int(SR*length); tt=np.arange(n)/SR
    env=np.exp(-tt*(2.2/(0.6+length*0.25)))*(1-np.exp(-tt*120))
    partials=[(1,1.0),(2,0.42*bright),(3,0.18*bright),(4,0.08*bright),(5,0.04*bright)]
    y=sum(a*np.sin(2*np.pi*freq*k*tt+rng.uniform(0,6.28))*np.exp(-tt*k*0.9) for k,a in partials)
    return y*env*vel*0.22
A=lambda m: 440*2**((m-69)/12)
chords=[[57,64,67,71,76],[53,60,64,69,72],[48,55,64,67,74],[55,59,62,67,71]]
piano=np.zeros_like(t); bar=8.0; k=0
while k*bar<DUR:
    ch=chords[k%4]; lift=1.0+0.35*(k*bar>=31)   # fuller from the decode onward
    place(piano,note(A(ch[0]-12),7.5,0.9,0.6),k*bar)
    order=[1,2,3,4,2,3,1,4]
    for j,idx in enumerate(order):
        st=k*bar+j*0.95+rng.uniform(-0.03,0.03)
        if st<DUR: place(piano,note(A(ch[idx]),4.5,(0.55+0.25*rng.random())*lift,1.0),st)
    if k*bar>=31:   # upper sparkle arpeggio, 16ths, once the pictures arrive
        for j in range(16):
            st=k*bar+j*0.475
            if st<DUR and st<80: place(piano,note(A(ch[1+(j*2)%4]+12),1.6,0.18+0.1*rng.random(),1.3),st)
    elif k%2==1: place(piano,note(A(ch[4]+12),5,0.35,1.2),k*bar+3.1)
    k+=1
# pad
pad=np.zeros_like(t)
for k2 in range(int(DUR/bar)+1):
    ch=chords[k2%4]; seg=(t>=k2*bar)&(t<(k2+1)*bar)
    env=np.clip((t-k2*bar)/2.5,0,1)*np.clip(((k2+1)*bar-t)/2.5,0,1)
    for m,a in [(ch[0],0.06),(ch[2],0.045),(ch[0]+12,0.03)]:
        f=A(m); pad+=seg*env*a*(np.sin(2*np.pi*f*t)+np.sin(2*np.pi*f*1.003*t)+0.5*np.sin(2*np.pi*f*0.5*t))
# heartbeat pulse 26–74 s: soft sine thump, lub-dub at 64 bpm
pulse=np.zeros_like(t)
def thump(vel,f0=55):
    n=int(SR*0.32); tt=np.arange(n)/SR
    return np.sin(2*np.pi*(f0*np.exp(-tt*9)+38)*tt)*np.exp(-tt*11)*vel
beat=60/64; tb=26.0
while tb<74:
    g=np.clip((tb-26)/4,0,1)*np.clip((74-tb)/3,0,1)
    place(pulse,thump(0.55*g),tb); place(pulse,thump(0.32*g,48),tb+0.19)
    tb+=beat
# risers + impacts on the flash cuts
FLASH=[13,31,51,66,80]
fx=np.zeros_like(t)
for c in FLASH:
    n=int(SR*1.4); tt=np.arange(n)/SR
    noise=rng.standard_normal(n)
    # crude band-pass by differencing + smoothing, swelling in amplitude and brightness
    b=np.convolve(noise,np.ones(int(SR*0.0008)),mode='same'); b=b-np.convolve(b,np.ones(int(SR*0.004))/int(SR*0.004),mode='same')
    b/= (np.abs(b).max()+1e-9); place(fx,b*(tt/1.4)**2.2*0.28,c-1.4)
    n2=int(SR*0.9); tt2=np.arange(n2)/SR
    place(fx,np.sin(2*np.pi*(42*np.exp(-tt2*5)+30)*tt2)*np.exp(-tt2*5)*0.7,c)
# tiny ticks on the hard cuts of the montage (26–31: every .22 s, 40–51: every 1.3 s)
tick=np.zeros_like(t)
for c in list(np.arange(26.2,30.0,0.22))+list(np.arange(40,50.5,1.3)):
    n=int(SR*0.03); y=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*400)*0.12; place(tick,y,c)
# reverb
ir=rng.standard_normal(int(SR*2.8))*np.exp(-np.arange(int(SR*2.8))/SR*1.6); ir/=np.sqrt((ir**2).sum())
def rev(x,wet=0.35):
    y=np.fft.irfft(np.fft.rfft(x,len(x)+len(ir))*np.fft.rfft(ir,len(x)+len(ir)))[:len(x)]
    return x*(1-wet)+y*wet*2.2
y=rev(piano,0.42)+rev(pad,0.3)+pulse+rev(fx,0.25)+rev(tick,0.5)
fade=np.minimum(1,t/2.5)*np.minimum(1,np.clip((DUR-t)/5,0,1))
y*=fade; y/=np.max(np.abs(y))+1e-9; y*=0.72
st=np.stack([y*0.98+np.roll(y,int(SR*0.012))*0.02, y*0.98+np.roll(y,int(SR*0.009))*0.02],1)
sf.write("brand2_music.wav",st.astype(np.float32),SR); print("ok",DUR)
