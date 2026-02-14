
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS as INITIAL_MENU, INITIAL_CONFIG } from './constants';
import { MenuItem, AppConfig, CartItem } from './types';

// --- Helper Functions ---
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

const formatCurrency = (val: number) => `฿${val.toLocaleString('th-TH')}`;

// --- Components ---

const CartSidebar: React.FC<{ 
  items: CartItem[], 
  onClose: () => void, 
  onUpdateQty: (id: number, delta: number) => void,
  config: AppConfig
}> = ({ items, onClose, onUpdateQty, config }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleCheckout = () => {
    const text = `Halo ${config.restaurantName}, saya ingin memesan:\n\n` + 
      items.map(i => `- ${i.name} (${i.quantity}x) = ${formatCurrency(i.price * i.quantity)}`).join('\n') +
      `\n\nTotal: ${formatCurrency(total)}\n\nMohon diproses, terima kasih!`;
    window.open(`https://wa.me/${config.socials.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark border-l border-white/10 h-full flex flex-col shadow-2xl animate-fade-in">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tighter">Pesanan Anda</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 italic">
              <span className="text-4xl mb-4">🛒</span>
              <p>Keranjang masih kosong...</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <img src={item.image} className="w-16 h-16 rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-sm leading-tight">{item.name}</p>
                  <p className="text-secondary font-bold text-xs">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center space-x-3 bg-dark p-1 rounded-lg">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="w-8 h-8 hover:bg-white/5 rounded">-</button>
                  <span className="text-xs font-bold">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="w-8 h-8 hover:bg-white/5 rounded">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="p-6 border-t border-white/5 space-y-4 bg-black/20">
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-xs uppercase tracking-widest">Total Pembayaran</span>
              <span className="text-2xl font-black text-secondary">{formatCurrency(total)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition active:scale-95"
            >
              Pesan via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminMasterDashboard: React.FC<{ 
  config: AppConfig, 
  setConfig: (c: AppConfig) => void, 
  menuItems: MenuItem[],
  setMenuItems: (m: MenuItem[]) => void,
  onClose: () => void 
}> = ({ config, setConfig, menuItems, setMenuItems, onClose }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [localMenu, setLocalMenu] = useState([...menuItems]);
  const [activeTab, setActiveTab] = useState<'Profil' | 'Menu' | 'Galeri' | 'Master'>('Profil');
  const [copyStatus, setCopyStatus] = useState("Salin Kode Global");

  const saveToLocal = () => {
    localStorage.setItem('batachi_master_config', JSON.stringify(localConfig));
    localStorage.setItem('batachi_master_menu', JSON.stringify(localMenu));
    setConfig(localConfig);
    setMenuItems(localMenu);
    alert("Berhasil disimpan di browser ini! Silakan cek tampilan web Anda.");
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: any) => {
    const updated = [...localMenu];
    updated[index] = { ...updated[index], [field]: value };
    setLocalMenu(updated);
  };

  const addMenuItem = () => {
    setLocalMenu([...localMenu, {
      id: Date.now(),
      name: "Menu Baru",
      price: 0,
      image: "https://picsum.photos/seed/new/600/400",
      category: 'Makanan',
      labels: [],
      isPO: false
    }]);
  };

  const generateGlobalCode = () => {
    return `export const INITIAL_CONFIG = ${JSON.stringify(localConfig, null, 2)};\n\nexport const MENU_ITEMS = ${JSON.stringify(localMenu, null, 2)};`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateGlobalCode());
    setCopyStatus("✅ Kode Berhasil Disalin!");
    setTimeout(() => setCopyStatus("Salin Kode Global"), 2000);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/98 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-[#121212] border border-white/10 w-full max-w-5xl rounded-[3rem] max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-[#1a1a1a] gap-6">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-dark font-black shadow-xl shadow-secondary/20">M</div>
             <div>
                <h2 className="text-xl font-black text-white tracking-tighter uppercase">Master Control</h2>
                <p className="text-[9px] text-gray-500 tracking-widest uppercase">Halo Boss Batachi! 👋</p>
             </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
            {(['Profil', 'Menu', 'Galeri', 'Master'] as const).map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white scale-105' : 'bg-white/5 text-gray-400'}`}
              >
                {tab === 'Master' ? '🚀 Publikasi Global' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scroll space-y-10">
          {activeTab === 'Profil' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-full bg-white/5 p-8 rounded-[2rem] border border-white/5 mb-4">
                 <h3 className="text-secondary text-[10px] font-black uppercase tracking-widest mb-4 italic">Identitas Warung</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nama Resto</label>
                      <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-secondary outline-none text-sm font-bold" value={localConfig.restaurantName} onChange={e => setLocalConfig({...localConfig, restaurantName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tagline Utama</label>
                      <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-secondary outline-none text-sm font-bold" value={localConfig.tagline} onChange={e => setLocalConfig({...localConfig, tagline: e.target.value})} />
                    </div>
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nomor WA Order (Tanpa '+')</label>
                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-secondary outline-none text-sm font-bold" value={localConfig.socials.whatsapp} onChange={e => setLocalConfig({...localConfig, socials: {...localConfig.socials, whatsapp: e.target.value}})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Jam Operasional</label>
                <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-secondary outline-none text-sm font-bold" value={localConfig.openingHours} onChange={e => setLocalConfig({...localConfig, openingHours: e.target.value})} />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Alamat Google Maps</label>
                <textarea className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-secondary outline-none text-sm font-bold" rows={3} value={localConfig.address} onChange={e => setLocalConfig({...localConfig, address: e.target.value})} />
              </div>
            </div>
          ) : activeTab === 'Menu' ? (
            <div className="space-y-6">
              <button onClick={addMenuItem} className="w-full py-5 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all">+ Tambah Item Menu Baru</button>
              {localMenu.map((item, idx) => (
                <div key={item.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 flex gap-6 items-start">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/5">
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input className="bg-transparent border-b border-white/10 p-2 text-sm font-black outline-none focus:border-secondary" value={item.name} onChange={e => updateMenuItem(idx, 'name', e.target.value)} placeholder="Nama Menu" />
                    <input type="number" className="bg-transparent border-b border-white/10 p-2 text-sm font-black outline-none focus:border-secondary" value={item.price} onChange={e => updateMenuItem(idx, 'price', parseInt(e.target.value))} placeholder="Harga" />
                    <input className="col-span-full bg-transparent border-b border-white/10 p-2 text-[10px] outline-none focus:border-secondary text-gray-500 italic" value={item.image} onChange={e => updateMenuItem(idx, 'image', e.target.value)} placeholder="URL Link Foto Menu" />
                    <div className="col-span-full flex items-center justify-between mt-2">
                       <label className="flex items-center space-x-3 text-[9px] font-black text-gray-500 uppercase tracking-widest cursor-pointer">
                          <input type="checkbox" checked={item.isPO} onChange={e => updateMenuItem(idx, 'isPO', e.target.checked)} className="w-4 h-4 rounded bg-dark border-white/10 text-secondary" />
                          <span>Status Pre-Order</span>
                       </label>
                       <button onClick={() => setLocalMenu(localMenu.filter(m => m.id !== item.id))} className="text-red-500 text-[9px] font-black uppercase tracking-widest">Hapus Item</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'Galeri' ? (
             <div className="grid grid-cols-1 gap-6">
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4">Link Foto Banner Utama (Hero)</label>
                   <input className="w-full bg-dark border border-white/10 p-4 rounded-xl text-xs text-secondary outline-none font-mono" value={localConfig.bannerImage} onChange={e => setLocalConfig({...localConfig, bannerImage: e.target.value})} />
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-6">Slider Foto Galeri</label>
                   <div className="space-y-4">
                      {localConfig.gallery.map((img, i) => (
                        <div key={i} className="flex items-center space-x-4">
                           <span className="text-[9px] text-gray-600 font-bold w-4">{i+1}</span>
                           <input className="flex-1 bg-dark border border-white/10 p-3 rounded-lg text-[10px] outline-none font-mono" value={img} onChange={e => {
                              const g = [...localConfig.gallery];
                              g[i] = e.target.value;
                              setLocalConfig({...localConfig, gallery: g});
                           }} />
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          ) : (
            <div className="space-y-8">
              <div className="p-10 bg-primary/10 border border-primary/20 rounded-[3rem] text-center">
                 <h4 className="text-secondary font-black uppercase text-sm tracking-tighter mb-4 italic">Update Website Konsumen</h4>
                 <p className="text-xs text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto">
                   Klik tombol di bawah untuk menyalin kode editan Anda. Lalu tempelkan (Paste) ke file <b>constants.tsx</b> di GitHub Anda untuk memperbarui tampilan bagi semua konsumen.
                 </p>
                 <button 
                  onClick={copyToClipboard}
                  className="w-full max-w-sm py-6 bg-white text-dark font-black rounded-3xl uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-[1.05] transition active:scale-95"
                >
                  {copyStatus}
                </button>
              </div>
              <div className="relative group">
                <pre className="bg-black/80 p-10 rounded-[2.5rem] text-[9px] font-mono text-gray-600 overflow-x-auto border border-white/5 max-h-60 custom-scroll">
                  {generateGlobalCode()}
                </pre>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer pointer-events-none">
                   <span className="text-[10px] font-black uppercase tracking-widest">Kode Konfigurasi Master</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-white/5 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-5 bg-[#1a1a1a]">
          <button onClick={saveToLocal} className="flex-1 bg-secondary text-dark font-black py-5 rounded-[1.5rem] uppercase text-[10px] tracking-[0.3em] hover:shadow-2xl hover:shadow-secondary/20 transition-all">Simpan di Browser Ini</button>
          <button onClick={onClose} className="px-10 py-5 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition">Keluar</button>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ 
  config: AppConfig, 
  openAdmin: () => void,
  cartCount: number,
  onOpenCart: () => void
}> = ({ config, openAdmin, cartCount, onOpenCart }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Menu', id: 'menu' },
    { name: 'Galeri', id: 'gallery' },
    { name: 'Kontak', id: 'kontak' },
  ];

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    scrollToSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${isScrolled ? 'bg-dark/90 backdrop-blur-2xl py-3 border-b border-white/5' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={(e) => handleNavClick(e, 'home')} className="flex items-center space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-secondary overflow-hidden bg-white/5 shadow-xl">
               <img src={config.logoUrl} className="w-full h-full object-cover" alt="Logo" />
            </div>
            <div className="text-left">
              <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase leading-none">
                {config.restaurantName.split(' ')[0]} <span className="text-secondary">{config.restaurantName.split(' ')[1] || ''}</span>
              </h1>
              <span className="text-[7px] md:text-[8px] font-bold text-gray-500 tracking-[0.3em] uppercase block mt-1 italic">Master Homemade</span>
            </div>
          </button>
          
          <div className="hidden lg:flex space-x-12">
            {navLinks.map((link) => (
              <button 
                key={link.id} 
                onClick={(e) => handleNavClick(e, link.id)} 
                className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-secondary transition-all relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-secondary transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <button 
              onClick={onOpenCart}
              className="relative p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition border border-white/10 group"
            >
              <span className="text-lg md:text-xl group-hover:scale-110 transition-transform block">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-dark animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="lg:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               <div className="w-6 h-0.5 bg-white mb-1.5"></div>
               <div className="w-6 h-0.5 bg-secondary mb-1.5"></div>
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[190] bg-dark transition-all duration-700 ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'} lg:hidden flex flex-col items-center justify-center space-y-10`}>
          {navLinks.map((link) => (
            <button key={link.id} onClick={(e) => handleNavClick(e, link.id)} className="text-4xl font-black uppercase tracking-tighter hover:text-secondary transition-colors italic">{link.name}</button>
          ))}
          <button onClick={() => setIsMobileMenuOpen(false)} className="mt-10 p-5 rounded-full border border-white/10 text-[9px] font-black tracking-widest uppercase text-gray-600">Tutup</button>
      </div>
    </>
  );
};

// --- HERO SLIDER COMPONENT ---
const HeroSlider: React.FC<{ menuItems: MenuItem[] }> = ({ menuItems }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastScrollTime = useRef(0);
  
  const totalSlides = menuItems.length;

  useEffect(() => {
    if ((window as any).gsap && (window as any).CustomEase) {
      (window as any).gsap.registerPlugin((window as any).CustomEase);
    }
  }, []);

  const animateSlide = (direction: 'up' | 'down') => {
    if (isAnimating) return;
    setIsAnimating(true);

    const nextIdx = direction === 'down' 
      ? (currentSlide === totalSlides ? 1 : currentSlide + 1)
      : (currentSlide === 1 ? totalSlides : currentSlide - 1);

    const nextItem = menuItems[nextIdx - 1];

    const slider = sliderRef.current!;
    const mainImgContainer = mainImageRef.current!;
    const titleRefCurrent = titleRef.current!;
    const descRefCurrent = descRef.current!;
    const counterRefCurrent = counterRef.current!;

    const currentSlideEl = slider.querySelector('.slide');
    const currentMainWrapper = mainImgContainer.querySelector('.slide-main-img-wrapper');
    const currentTitle = titleRefCurrent.querySelector('h1');
    const currentDesc = descRefCurrent.querySelector('p');
    const currentCounter = counterRefCurrent.querySelector('p');

    const newSlide = document.createElement('div');
    newSlide.className = 'slide';
    newSlide.innerHTML = `<div class="slide-bg-img" style="clip-path: ${direction === 'down' ? 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'}"><img src="${nextItem.image}" alt="" /></div>`;
    
    const newMainWrapper = document.createElement('div');
    newMainWrapper.className = 'slide-main-img-wrapper';
    newMainWrapper.style.clipPath = direction === 'down' ? 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' : 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';
    newMainWrapper.innerHTML = `<img src="${nextItem.image}" alt="" />`;

    const newTitle = document.createElement('h1');
    newTitle.textContent = nextItem.name;
    // Menggunakan persentase agar selalu keluar dari viewport container tanpa peduli tinggi teks
    (window as any).gsap.set(newTitle, { yPercent: direction === 'down' ? 100 : -100 });

    const newDesc = document.createElement('p');
    newDesc.textContent = nextItem.category;
    (window as any).gsap.set(newDesc, { yPercent: direction === 'down' ? 100 : -100 });

    const newCounter = document.createElement('p');
    newCounter.textContent = nextIdx.toString();
    (window as any).gsap.set(newCounter, { yPercent: direction === 'down' ? 100 : -100 });

    slider.appendChild(newSlide);
    mainImgContainer.appendChild(newMainWrapper);
    titleRefCurrent.appendChild(newTitle);
    descRefCurrent.appendChild(newDesc);
    counterRefCurrent.appendChild(newCounter);

    (window as any).gsap.set(newMainWrapper.querySelector('img'), {
      y: direction === 'down' ? "-50%" : "50%"
    });

    const ease = ".87, 0, .13, 1";
    const tl = (window as any).gsap.timeline({
      onComplete: () => {
        currentSlideEl?.remove();
        currentMainWrapper?.remove();
        currentTitle?.remove();
        currentDesc?.remove();
        currentCounter?.remove();
        setCurrentSlide(nextIdx);
        setIsAnimating(false);
      }
    });

    tl.to(newSlide.querySelector('.slide-bg-img'), {
      clipPath: direction === 'down' ? "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)" : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1.25,
      ease: ease
    }, 0)
    .to(currentSlideEl!.querySelector('img'), {
      scale: 1.5,
      duration: 1.25,
      ease: ease
    }, 0)
    .to(newMainWrapper, {
      clipPath: direction === 'down' ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
      duration: 1.25,
      ease: ease
    }, 0)
    .to(currentMainWrapper!.querySelector('img'), {
      y: direction === 'down' ? "50%" : "-50%",
      duration: 1.25,
      ease: ease
    }, 0)
    .to(newMainWrapper.querySelector('img'), {
      y: 0,
      duration: 1.25,
      ease: ease
    }, 0)
    .to(currentTitle, {
      yPercent: direction === 'down' ? -100 : 100,
      duration: 1.25,
      ease: ease
    }, 0)
    .to(newTitle, {
      yPercent: 0,
      duration: 1.25,
      ease: ease
    }, 0)
    .to(currentDesc, {
      yPercent: direction === 'down' ? -100 : 100,
      duration: 1.25,
      ease: ease
    }, 0)
    .to(newDesc, {
      yPercent: 0,
      duration: 1.25,
      ease: ease
    }, 0)
    .to(currentCounter, {
      yPercent: direction === 'down' ? -100 : 100,
      duration: 1.25,
      ease: ease
    }, 0)
    .to(newCounter, {
      yPercent: 0,
      duration: 1.25,
      ease: ease
    }, 0);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (window.scrollY > 100) return;
      const now = Date.now();
      if (now - lastScrollTime.current < 1000) return;
      lastScrollTime.current = now;
      const direction = e.deltaY > 0 ? 'down' : 'up';
      animateSlide(direction);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide, isAnimating, menuItems]);

  return (
    <div id="home" className="slider-container" ref={sliderRef}>
      <div className="slide">
        <div className="slide-bg-img">
          <img src={menuItems[0].image} alt="" />
        </div>
      </div>

      <div className="slide-main-img" ref={mainImageRef}>
        <div className="slide-main-img-wrapper">
          <img src={menuItems[0].image} alt="" />
        </div>
      </div>

      <div className="slide-copy">
        <div className="slide-title" ref={titleRef}>
          <h1>{menuItems[0].name}</h1>
        </div>
        <div className="slide-description" ref={descRef}>
          <p>{menuItems[0].category}</p>
        </div>
        <button 
          onClick={() => scrollToSection('menu')}
          className="mt-6 md:mt-10 px-8 md:px-10 py-3 md:py-4 bg-secondary text-dark font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] rounded-full hover:scale-110 transition shadow-2xl"
        >
          Lihat Menu
        </button>
      </div>

      <div className="slider-footer">
        <div className="flex flex-col items-start gap-2">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Signature Items</p>
           <div className="slider-counter">
              <div className="count" ref={counterRef}>
                <p>{currentSlide}</p>
              </div>
              <p className="opacity-30 mx-2">/</p>
              <p className="opacity-30">{totalSlides}</p>
           </div>
        </div>
        <div className="hidden md:flex flex-col items-end opacity-20 italic">
           <p className="text-[8px] font-black uppercase tracking-widest">Scroll / Swipe</p>
           <p className="text-[8px] font-black uppercase tracking-widest">To Experience</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [poItem, setPoItem] = useState<MenuItem | null>(null);
  const [filter, setFilter] = useState<'Semua' | 'Makanan' | 'Minuman' | 'Cemilan'>('Semua');

  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash === '#adminmaster991') {
        setIsAdminOpen(true);
      }
    };

    const savedConfig = localStorage.getItem('batachi_master_config');
    const savedMenu = localStorage.getItem('batachi_master_menu');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedMenu) setMenuItems(JSON.parse(savedMenu));

    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);

    const timer = setTimeout(() => setLoading(false), 2000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', checkAdminHash);
    };
  }, []);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (filter !== 'Semua') items = items.filter(i => i.category === (filter as any));
    return items;
  }, [filter, menuItems]);

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const isOpenNow = () => {
    const hours = new Date().getHours();
    return hours >= 10 && hours <= 21;
  };

  return (
    <div className="relative min-h-screen bg-dark text-white font-sans selection:bg-primary/30 scroll-smooth">
      {loading ? (
        <div className="fixed inset-0 z-[300] bg-dark flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-secondary rounded-3xl animate-spin mb-10 shadow-2xl shadow-primary/30"></div>
          <p className="text-secondary font-black tracking-[1em] text-[10px] animate-pulse uppercase ml-[1em]">Warung Batachi</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          <Header 
            config={config} 
            openAdmin={() => setIsAdminOpen(true)} 
            cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
          />
          
          <HeroSlider menuItems={menuItems} />

          <section id="menu" className="py-40 px-6 container mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                <div>
                   <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">Best <span className="text-secondary not-italic">Sellers</span></h2>
                   <p className="text-gray-500 mt-4 tracking-[0.5em] uppercase text-[9px] font-bold italic">Cita Rasa Otentik Batachi</p>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
                    {['Semua', 'Makanan', 'Minuman', 'Cemilan'].map(c => (
                      <button key={c} onClick={() => setFilter(c as any)} className={`px-10 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === c ? 'bg-secondary text-dark shadow-xl shadow-secondary/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}>{c}</button>
                    ))}
                </div>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white/5 rounded-[3.5rem] overflow-hidden border border-white/5 group hover:border-primary/50 transition-all duration-700">
                    <div className="h-80 overflow-hidden relative">
                       <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]" alt="" />
                       {item.isPO && <span className="absolute top-8 right-8 bg-secondary text-dark px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl animate-pulse">Pre-Order</span>}
                    </div>
                    <div className="p-12">
                       <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{item.name}</h3>
                       <p className="text-secondary font-black text-xl mb-10">{formatCurrency(item.price)}</p>
                       <button 
                         onClick={() => item.isPO ? setPoItem(item) : addToCart(item)} 
                         className={`w-full py-5 font-black rounded-2xl uppercase text-[10px] tracking-widest transition-all duration-500 ${item.isPO ? 'bg-primary text-white shadow-xl hover:scale-[1.02]' : 'border border-white/10 hover:bg-white/10'}`}
                       >
                         {item.isPO ? 'Pesan PO Sekarang' : 'Tambah Pesanan'}
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          <section id="gallery" className="py-40 bg-[#0a0a0a] overflow-hidden">
             <div className="container mx-auto px-6 mb-24">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-center">Batachi <span className="text-secondary not-italic">Vibes</span></h2>
             </div>
             <div className="flex gap-10 overflow-x-auto px-6 no-scrollbar snap-x pb-10">
                {config.gallery.map((img, i) => (
                  <div key={i} className="min-w-[320px] md:min-w-[650px] h-[450px] rounded-[4rem] overflow-hidden snap-center border border-white/5 shadow-2xl">
                    <img src={img} className="w-full h-full object-cover hover:scale-105 transition duration-1000" alt="" />
                  </div>
                ))}
             </div>
          </section>

          <section id="kontak" className="py-40 px-6 container mx-auto">
             <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div>
                   <h2 className="text-6xl md:text-8xl font-black mb-14 uppercase tracking-tighter leading-none italic">Our <span className="text-secondary not-italic">Store.</span></h2>
                   <div className="space-y-12">
                      <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-4 italic">Alamat Lengkap</p>
                         <p className="text-2xl font-bold leading-relaxed">{config.address}</p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-10">
                         <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 flex-1">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-4 italic">Jam Buka</p>
                            <p className="text-3xl font-black text-secondary">{config.openingHours}</p>
                            <div className={`inline-block mt-6 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${isOpenNow() ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                               {isOpenNow() ? 'Ready Melayani' : 'Toko Tutup'}
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-5 pt-6">
                         <a href={`https://wa.me/${config.socials.whatsapp.replace(/\D/g, '')}`} className="flex-1 min-w-[200px] text-center px-10 py-6 bg-[#25D366] text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:scale-105 transition">WhatsApp Chat</a>
                         <a href={`https://instagram.com/${config.socials.instagram}`} className="flex-1 min-w-[200px] text-center px-10 py-6 glassmorphism rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-white/10 transition">Instagram</a>
                      </div>
                   </div>
                </div>
                <div className="h-[650px] rounded-[5rem] overflow-hidden border border-white/10 shadow-3xl">
                   <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.60803126937!2d100.56064041151622!3d13.742111186591605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f0000000001%3A0x0!2sSukhumvit%2023!5e0!3m2!1sid!2sid!4v1625210000000!5m2!1sid!2sid" width="100%" height="100%" style={{ border: 0 }} loading="lazy"></iframe>
                </div>
             </div>
          </section>

          <footer className="py-24 border-t border-white/5 text-center mt-40 opacity-50">
             <h3 className="text-4xl font-black uppercase italic mb-6 tracking-tighter">Warung <span className="text-secondary">Batachi</span></h3>
             <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.8em] italic">&copy; {new Date().getFullYear()} • Premium Taste Experience</p>
          </footer>

          {poItem && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
               <div className="bg-dark border border-white/10 p-10 rounded-[3rem] w-full max-w-md text-center shadow-2xl">
                  <h4 className="text-xl font-black uppercase mb-8 italic">Pilih Platform PO</h4>
                  <div className="grid grid-cols-2 gap-4 mb-10">
                     <a href={`https://wa.me/${config.socials.whatsapp}?text=Halo Batachi, saya mau PO: ${poItem.name}`} className="p-8 bg-white/5 rounded-3xl hover:bg-secondary/20 transition group border border-white/5">
                        <span className="text-4xl block mb-3 group-hover:scale-110 transition">💬</span>
                        <span className="text-[10px] font-black uppercase">WhatsApp</span>
                     </a>
                     <a href={`https://instagram.com/${config.socials.instagram}`} className="p-8 bg-white/5 rounded-3xl hover:bg-secondary/20 transition border border-white/5 group">
                        <span className="text-4xl block mb-3 group-hover:scale-110 transition">📸</span>
                        <span className="text-[10px] font-black uppercase">Instagram</span>
                     </a>
                  </div>
                  <button onClick={() => setPoItem(null)} className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] hover:text-white transition">Kembali</button>
               </div>
            </div>
          )}
          {isCartOpen && <CartSidebar items={cartItems} onClose={() => setIsCartOpen(false)} onUpdateQty={updateCartQty} config={config} />}
          {isAdminOpen && <AdminMasterDashboard config={config} setConfig={setConfig} menuItems={menuItems} setMenuItems={setMenuItems} onClose={() => setIsAdminOpen(false)} />}
        </div>
      )}
    </div>
  );
};

export default App;
