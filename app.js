const firebaseConfig = {
    apiKey: "AIzaSyBJGIsMhKlucjvP9XY5MThhcPyZfQRAc0Y",
    authDomain: "x-project-94a25.firebaseapp.com",
    databaseURL: "https://x-project-94a25-default-rtdb.firebaseio.com",
    projectId: "x-project-94a25",
    storageBucket: "x-project-94a25.firebasestorage.app",
    messagingSenderId: "773919021884",
    appId: "1:773919021884:web:35c525cfa8e71e91835c39"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ربط عناصر واجهة المستخدم
const categoriesContainer = document.getElementById('categoriesContainer');
const channelsGridContainer = document.getElementById('channelsGridContainer');
const searchInput = document.getElementById('searchInput');
const currentSectionTitle = document.getElementById('currentSectionTitle');
const themeToggleBtn = document.getElementById('themeToggleBtn');

let favorites = JSON.parse(localStorage.getItem('kurd_stream_favs')) || [];
let categoriesData = {};
let channelsData = {};
let activeCategoryId = "all"; // الافتراضي عرض كل القنوات

// 🌙 1. الوضع الليلي والنهاري المحفوظ بالذاكرة
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.innerText = "☀️";
}
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggleBtn.innerText = isLight ? "☀️" : "🌙";
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// ℹ 2. نافذة معلومات التطبيق المنبثقة
const infoModal = document.getElementById('infoModal');
document.getElementById('infoBtn').addEventListener('click', () => infoModal.style.display = 'flex');
document.getElementById('closeInfoBtn').addEventListener('click', () => infoModal.style.display = 'none');

// 📥 3. جلب الأقسام والقنوات من Firebase وبناء الأزرار العلوية
database.ref('categories').on('value', (catSnapshot) => {
    categoriesData = catSnapshot.val() || {};
    
    database.ref('channels').on('value', (chSnapshot) => {
        channelsData = chSnapshot.val() || {};
        renderCategoriesChips();
        renderChannelsGrid();
    });
});

// 🔘 4. بناء أزرار الأقسام الدائرية (Chips) في الأعلى كالصورة
function renderCategoriesChips() {
    categoriesContainer.innerHTML = '';

    // أزرار ثابتة مساعدة (كل القنوات والمفضلة)
    createChip("all", "الكل");
    createChip("fav", "المفضلة ⭐");

    // جلب بقية الأقسام ديناميكياً من الأدمن
    Object.keys(categoriesData).forEach((catId) => {
        createChip(catId, categoriesData[catId].name);
    });
}

function createChip(id, name) {
    const chip = document.createElement('div');
    chip.className = `category-chip ${activeCategoryId === id ? 'active' : ''}`;
    chip.innerText = name;
    
    chip.addEventListener('click', () => {
        activeCategoryId = id;
        currentSectionTitle.innerText = id === 'all' ? 'كل القنوات' : id === 'fav' ? 'قنواتي المفضلة' : name;
        
        // تحديث حالة الأزرار النشطة
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        renderChannelsGrid();
    });

    categoriesContainer.appendChild(chip);
}

// 📺 5. دالة عرض القنوات بالشبكة والتحكم بالبحث والفلاتر
function renderChannelsGrid() {
    channelsGridContainer.innerHTML = '';
    const searchQuery = searchInput.value.toLowerCase().trim();

    Object.keys(channelsData).forEach((chKey) => {
        const channel = channelsData[chKey];
        const isFav = favorites.includes(chKey);

        // شروط الفلترة
        const matchesSearch = channel.name.toLowerCase().includes(searchQuery);
        let matchesCategory = false;

        if (activeCategoryId === "all") {
            matchesCategory = true;
        } else if (activeCategoryId === "fav") {
            matchesCategory = isFav;
        } else if (channel.category === activeCategoryId) {
            matchesCategory = true;
        }

        if (matchesSearch && matchesCategory) {
            const box = document.createElement('div');
            box.className = 'channel-box';
            box.innerHTML = `
                <div class="heart-icon ${isFav ? 'is-favorite' : ''}">🤍</div>
                <div class="channel-icon-wrapper" style="background-image: url('${channel.logo}')"></div>
                <div class="channel-box-title">${channel.name}</div>
            `;

            // إصلاح زر القلب ليعمل فوراً باللمس بدون تداخل مع فتح القناة
            box.querySelector('.heart-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(chKey);
            });

            // فتح صفحة البث المخصصة للقناة عند النقر
            box.addEventListener('click', () => {
                const encodedName = encodeURIComponent(channel.name);
                const encodedUrl = encodeURIComponent(channel.url);
                window.location.href = `player.html?name=${encodedName}&url=${encodedUrl}`;
            });

            channelsGridContainer.appendChild(box);
        }
    });

    if (channelsGridContainer.innerHTML === '') {
        channelsGridContainer.innerHTML = `<p style="grid-column: span 2; text-align:center; color:var(--text-muted); margin-top:30px;">لا توجد قنوات متوفرة.</p>`;
    }
}

// 💙 6. إضافة وإزالة المفضلة
function toggleFavorite(chKey) {
    if (favorites.includes(chKey)) {
        favorites = favorites.filter(k => k !== chKey);
    } else {
        favorites.push(chKey);
    }
    localStorage.setItem('kurd_stream_favs', JSON.stringify(favorites));
    renderChannelsGrid(); // تحديث فوري للشاشة
}

// 🔍 7. تفعيل شريط البحث أثناء الكتابة المباشرة
searchInput.addEventListener('input', renderChannelsGrid);
