(function(){
  var root=document.documentElement;
  root.classList.add('js');
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO='IntersectionObserver' in window;



  /* reveal on scroll */
  var reveals=document.querySelectorAll('.reveal,.img-in');
  if(hasIO&&!reduced){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    reveals.forEach(function(el){io.observe(el)});
  }else{reveals.forEach(function(el){el.classList.add('in')})}

  /* scroll progress + support line (desktop) */
  var bar=document.getElementById('progress'),steps=document.getElementById('steps'),svcs=steps.querySelectorAll('.svc'),ticking=false;
  var wide=matchMedia('(min-width:960px)');
  var header=document.querySelector('.header'),toTop=document.getElementById('toTop'),plx=document.querySelectorAll('[data-parallax]');
  function onScroll(){
    var h=root.scrollHeight-innerHeight;
    bar.style.setProperty('--p',h>0?(scrollY/h).toFixed(4):0);
    header.classList.toggle('scrolled',scrollY>24);
    toTop.classList.toggle('show',scrollY>innerHeight*.9);
    if(!reduced)plx.forEach(function(img){
      var r=img.parentElement.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)return;
      img.style.setProperty('--py',((r.top+r.height/2-innerHeight/2)*-.1).toFixed(1)+'px');
    });
    if(wide.matches){
      var r=steps.getBoundingClientRect(),p=(innerHeight*.7-r.top)/r.height;
      p=Math.max(0,Math.min(1,p));
      steps.style.setProperty('--p',p.toFixed(3));
      svcs.forEach(function(s,i){s.classList.toggle('lit',p>=(i/svcs.length)+.05)});
    }else{
      svcs.forEach(function(s){s.classList.toggle('lit',s.getBoundingClientRect().top<innerHeight*.72)});
    }
    ticking=false;
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  addEventListener('resize',onScroll);onScroll();

  /* carousels: snap paging, right to left */
  document.querySelectorAll('.rail').forEach(function(rail){
    var pager=rail.parentElement.querySelector('.pager');
    if(!pager)return;
    var cnt=rail.parentElement.querySelector('.count');
    var dots=[].slice.call(pager.children),cards=[].slice.call(rail.children,0,dots.length),lock=false;
    function current(){
      var edge=rail.getBoundingClientRect().right-18,best=0,bd=Infinity;
      cards.forEach(function(c,i){var dx=Math.abs(c.getBoundingClientRect().right-edge);if(dx<bd){bd=dx;best=i}});
      return best;
    }
    function paint(){
      var i=current();
      dots.forEach(function(d,n){d.classList.toggle('on',n===i)});
      if(cnt)cnt.textContent=(i+1).toLocaleString('fa-IR')+' از '+dots.length.toLocaleString('fa-IR');
    }
    rail.addEventListener('scroll',function(){if(!lock)requestAnimationFrame(paint)},{passive:true});
    dots.forEach(function(d,i){d.addEventListener('click',function(){lock=true;cards[i].scrollIntoView({behavior:reduced?'auto':'smooth',inline:'start',block:'nearest'});setTimeout(function(){lock=false;paint()},reduced?0:450)})});
    paint();
  });

  /* comparison: expand remaining items (desktop) */
  var cmpSec=document.getElementById('changes'),cmpBtn=document.getElementById('cmpMore'),cmpPeek=document.querySelector('#cmpRail .peek');
  function setCmp(open){
    cmpSec.classList.toggle('open',open);
    cmpBtn.setAttribute('aria-expanded',String(open));
    cmpBtn.firstElementChild.textContent=open?'نمایش کمتر':'نمایش ۵ مورد دیگر';
    if(!open)cmpSec.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
  }
  cmpBtn.addEventListener('click',function(){setCmp(!cmpSec.classList.contains('open'))});
  cmpPeek.addEventListener('click',function(){if(wide.matches&&!cmpSec.classList.contains('open'))setCmp(true)});

  /* current step label + active nav */
  
  var links=document.querySelectorAll('.journey a,.desk-nav a');
  if(hasIO){
    var cur='';
    var sio=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;
      var id=e.target.id;if(id===cur)return;cur=id;
      links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+id)});
    })},{rootMargin:'-40% 0px -55% 0px'});
    document.querySelectorAll('main section[id]').forEach(function(s){sio.observe(s)});
  }

  /* menu sheet */
  var menu=document.getElementById('menu'),menuBtn=document.getElementById('menuBtn');
  function setMenu(open){
    menu.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));
    menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'بستن منو':'باز کردن منو');
    root.classList.toggle('locked',open);
    if(open)menu.querySelector('.journey a').focus({preventScroll:true});else menuBtn.focus({preventScroll:true});
  }
  menuBtn.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
  menu.querySelector('[data-close-menu]').addEventListener('click',function(){setMenu(false)});
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open'))setMenu(false)});

  /* bottom sheets */
  function openDlg(d){if(typeof d.showModal!=='function')return;d.showModal();root.classList.add('locked');var b=d.querySelector('.sheet-body');if(b)b.scrollTop=0}
  function closeDlg(d){
    if(!d.open)return;
    if(reduced){d.close();return}
    d.classList.add('closing');
    setTimeout(function(){d.classList.remove('closing');d.close()},320);
  }
  document.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){openDlg(document.getElementById(b.dataset.open))})});
  document.querySelectorAll('dialog').forEach(function(d){
    d.querySelector('[data-close]').addEventListener('click',function(){closeDlg(d)});
    d.addEventListener('cancel',function(e){e.preventDefault();closeDlg(d)});
    d.addEventListener('close',function(){root.classList.remove('locked')});
    d.addEventListener('click',function(e){if(e.target!==d)return;var r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDlg(d)});
    var y0=null;
    d.querySelector('.sheet-head').addEventListener('touchstart',function(e){y0=e.touches[0].clientY},{passive:true});
    d.querySelector('.sheet-head').addEventListener('touchend',function(e){if(y0!==null&&e.changedTouches[0].clientY-y0>60)closeDlg(d);y0=null});
  });  /* accordion */
  document.querySelectorAll('.qa-q').forEach(function(q){q.addEventListener('click',function(){
    var item=q.parentElement,open=!item.classList.contains('open');
    document.querySelectorAll('.qa.open').forEach(function(o){if(o!==item){o.classList.remove('open');o.querySelector('.qa-q').setAttribute('aria-expanded','false')}});
    item.classList.toggle('open',open);q.setAttribute('aria-expanded',String(open));
  })});})();
