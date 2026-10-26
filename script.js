'use strict';

// Historical claims below are limited to the user's supplied source text.
const timelineEvents = [
  {date:'საუკუნეების განმავლობაში',title:'ჰერეთი და კახეთი',category:'culture',tag:'ისტორიული კავშირი',text:'ჰერეთი მჭიდროდ იყო დაკავშირებული კახეთთან და საქართველოს პოლიტიკურ, კულტურულ და რელიგიურ ცხოვრებასთან.'},
  {date:'XX საუკუნის დასაწყისი',title:'სამხრეთ კავკასიის პოლიტიკური გარდაქმნა',category:'politics',tag:'რეგიონული კონტექსტი',text:'რუსეთის იმპერიის დაშლამ და ახალი სახელმწიფოების ჩამოყალიბების პროცესმა რეგიონში არსებული ტერიტორიული საკითხები გაამწვავა.'},
  {date:'1918 წლის 26 მაისი',title:'საქართველოს დამოუკიდებლობა',category:'politics',tag:'საქართველოს დემოკრატიული რესპუბლიკა',text:'საქართველომ დამოუკიდებლობა გამოაცხადა. ახალ სახელმწიფოს წინაშე იდგა საზღვრების დადგენისა და ტერიტორიული მთლიანობის საკითხები.'},
  {date:'1920 წლის 7 მაისი',title:'ხელშეკრულება საბჭოთა რუსეთთან',category:'politics',tag:'ზაქათალის ოლქი',text:'მოწოდებული ტექსტის მიხედვით, ხელშეკრულებით ზაქათალის ოლქი საქართველოსთან დაკავშირებულ ტერიტორიად იქნა აღიარებული, თუმცა საკითხი საბოლოოდ გადაწყვეტილი არ ყოფილა.'},
  {date:'1921 წელი',title:'საქართველოს ოკუპაცია',category:'politics',tag:'პოლიტიკური გარდატეხა',text:'საბჭოთა რუსეთის სამხედრო თავდასხმის შედეგად საქართველოს დემოკრატიული რესპუბლიკა დაეცა. საბჭოთა ხელისუფლების დამყარებამ საზღვრების საკითხზე მნიშვნელოვანი გავლენა მოახდინა.'},
  {date:'1921 წლის ივლისი',title:'საინგილო აზერბაიჯანის შემადგენლობაში',category:'politics',tag:'ადმინისტრაციული საზღვარი',text:'საქართველოსა და აზერბაიჯანის საბჭოთა რესპუბლიკებს შორის მიღებული გადაწყვეტილებით, საინგილო აზერბაიჯანის შემადგენლობაში დარჩა.'},
  {date:'საბჭოთა პერიოდი',title:'ენისა და ტრადიციების შენარჩუნება',category:'identity',tag:'ენა და იდენტობა',text:'წყაროს მიხედვით, ადგილობრივი ქართველების ნაწილმა შეინარჩუნა ქართული ენა, ტრადიციები და კულტურული მემკვიდრეობის ნაწილი. ინგილოებში იყვნენ ქრისტიანი და მუსლიმი ქართველები.'},
  {date:'დღემდე არსებული მემკვიდრეობა',title:'ქართული კულტურული ძეგლები',category:'culture',tag:'კულტურული მეხსიერება',text:'ქურმუხის წმინდა გიორგის ტაძარი და სხვა ისტორიული ძეგლები ტექსტში ქართული კულტურისა და მრავალსაუკუნოვანი კავშირების მნიშვნელოვან ნიშნებად არის წარმოდგენილი.'}
];

const mapModes = {
  region: {number:'MAP 01',label:'ისტორიული კავშირები',title:'ჰერეთი და მიმდებარე მხარეები',description:'საინგილო, რომელიც კახის, ზაქათალისა და ბელაქნის მიდამოებს მოიცავს, ისტორიულად უკავშირდება ჰერეთის ჩრდილო-აღმოსავლეთ ნაწილს. რუკა ამ კავშირების სქემატური ილუსტრაციაა.',fill:'rgba(156,137,91,.38)',boundary:'M349 139 Q392 206 386 374',overlay:'ისტორიული კავშირები'},
  '1920': {number:'MAP 02',label:'ხელშეკრულება · 1920',title:'ზაქათალის ოლქის საკითხი',description:'1920 წლის 7 მაისის ხელშეკრულებით ზაქათალის ოლქი საქართველოსთან დაკავშირებულ ტერიტორიად იქნა აღიარებული; მოწოდებული ტექსტი ხაზს უსვამს, რომ საკითხი საბოლოოდ გადაწყვეტილი არ ყოფილა.',fill:'rgba(213,189,130,.5)',boundary:'M320 128 Q390 184 430 260 T386 374',overlay:'1920 · საკითხი ღია რჩება'},
  '1921': {number:'MAP 03',label:'ადმინისტრაციული ცვლილება · 1921',title:'საინგილოს პოლიტიკური მდგომარეობა',description:'წყაროს მიხედვით, 1921 წლის ივლისში მიღებული გადაწყვეტილებით საინგილო აზერბაიჯანის შემადგენლობაში დარჩა. რუკა ცვლილების იდეას სქემატურად აჩვენებს და ზუსტ სახელმწიფო საზღვრებს არ განსაზღვრავს.',fill:'rgba(133,151,119,.35)',boundary:'M349 139 Q355 215 420 245 T520 281',overlay:'1921 · ადმინისტრაციული ცვლილება'}
};
const placeDescriptions = {
  kakheti:['კახეთი','წყარო ჰერეთის ხანგრძლივ კავშირს კახეთთან და საქართველოს პოლიტიკურ, კულტურულ და რელიგიურ ცხოვრებასთან აღნიშნავს.'],
  zagatala:['ზაქათალის ოლქი','1920 წლის 7 მაისის ხელშეკრულებით საქართველოსთან დაკავშირებულ ტერიტორიად იქნა აღიარებული; საკითხი საბოლოოდ გადაწყვეტილი არ ყოფილა.'],
  belokani:['ბელაქანი','ბელაქნის მიდამოები ტექსტში საინგილოს გეოგრაფიულ არეალთან არის დაკავშირებული.'],
  kakh:['კახი','კახი ტექსტში საინგილოს იმ მიდამოებს შორისაა ნახსენები, რომლებიც ისტორიულ ჰერეთთან კავშირში განიხილება.']
};

const timelineList = document.getElementById('timelineList');
function renderTimeline(filter='all') {
  const filtered = timelineEvents.filter(event => filter === 'all' || event.category === filter);
  timelineList.innerHTML = filtered.map((event, index) => `
    <article class="timeline-item" style="animation-delay:${index * 55}ms">
      <div class="timeline-date">${event.date}</div><h3>${event.title}</h3><p>${event.text}</p><span class="timeline-tag">${event.tag}</span>
    </article>`).join('');
}
renderTimeline();
document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-button').forEach(item => item.classList.toggle('active', item === button));
  renderTimeline(button.dataset.filter);
}));

document.querySelectorAll('.map-tab').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.map-tab').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); });
  const mode = mapModes[button.dataset.map];
  document.getElementById('mapNumber').textContent = mode.number;
  document.getElementById('mapTitle').textContent = mode.title;
  document.getElementById('mapDescription').textContent = mode.description;
  document.getElementById('mapOverlayLabel').textContent = mode.overlay;
  document.querySelector('.region-fill').style.fill = mode.fill;
  document.querySelector('.boundary-dash').setAttribute('d', mode.boundary);
  document.getElementById('placeInfo').innerHTML = '<strong>აირჩიე რუკაზე მონიშნული ადგილი</strong><span>მოკლე განმარტება აქ გამოჩნდება.</span>';
}));
function showPlace(place) {
  const item = placeDescriptions[place];
  if (!item) return;
  document.getElementById('placeInfo').innerHTML = `<strong>${item[0]}</strong><span>${item[1]}</span>`;
}
document.querySelectorAll('.map-city').forEach(point => {
  point.addEventListener('click', () => showPlace(point.dataset.place));
  point.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showPlace(point.dataset.place); } });
});

document.querySelectorAll('.motion-button').forEach(button => button.addEventListener('click', () => {
  const card = button.closest('.warrior-card');
  const active = card.classList.toggle('is-animated');
  button.setAttribute('aria-pressed', String(active));
  button.innerHTML = active ? 'მოძრაობის შეჩერება <span>Ⅱ</span>' : 'მოძრაობის ჩვენება <span>↗</span>';
}));

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'მენიუს დახურვა' : 'მენიუს გახსნა');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false');
}));

const progress = document.getElementById('scrollProgress');
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
}
window.addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
}), {threshold:0.12});
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
document.getElementById('yearNow').textContent = new Date().getFullYear();
