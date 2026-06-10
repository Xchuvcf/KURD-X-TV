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

const rowsContainer = document.getElementById('dynamicRowsContainer');
const searchInput = document.getElementById('searchInput');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const filterFavBtn = document.getElementById('filterFavBtn');

// مخزن محلي لحفظ معرفات (IDs) القنوات المفضلة بجهاز المستخدم
let favorites = JSON.parse(localStorage.getItem('kurd_stream_favs')) || [];
let allChannelsData = {}; 
let categoriesData = {};
let showOnlyFavorites = false;

// 🌙 1. تفعيل وضع النهار والليل المحفوظ بالذاكرة
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.innerText = "☀️";
}
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        themeToggleBtn.innerText = "☀️";
        localStorage.setItem('theme', 'light');
    } else {
        themeToggleBtn.innerText = "🌙";
        localStorage.setItem('theme', 'dark');
    }
});

// ℹ 2. تفعيل نافذة المعلومات
const infoModal = document.getElementById('infoModal');
document.getElementById('infoBtn').addEventListener('click', () => infoModal.style.display = 'flex');
document.getElementById('closeInfoBtn').addEventListener('click', () => infoModal.style.display = 'none');

// 📥 3. جلب البيانات الأساسية من Firebase وإدارتها محلياً للسرعة والفلترة المباشرة
database.ref('categories').on('value', (catSnapshot) => {
    categoriesData = catSnapshot.val() || {};
    fetchChannelsAndRender();
});

function fetchChannelsAndRender() {
    database.ref('channels').on('value', (chSnapshot) => {
        allChannelsData = chSnapshot.val() || {};
        renderUI(); // بناء الواجهة
    });
}

// 🛠️ 4. دالة بناء الواجهة والتحكم بالبحث والمفضلة
function renderUI() {
    rowsContainer.innerHTML = '';
    const searchQuery = searchInput.value.toLowerCase().trim();

    Object.keys(categoriesData).forEach((catId) => {
        const cat = categoriesData[catId];
        
        // تصفية القنوات بناءً على البحث أو وضع المفضلة
        let filteredChannels = [];
        Object.keys(allChannelsData).forEach((chKey) => {
            const channel = allChannelsData[chKey];
            if (channel.category === catId) {
                const matchesSearch = channel.name.toLowerCase().includes(searchQuery);
                const matchesFav = !showOnlyFavorites || favorites.includes(chKey);
                
                if (matchesSearch && matchesFav) {
                    filteredChannels.push({ key: chKey, ...channel });
                }
            }
        });

        // إذا كان هناك قنوات تطابق الشروط في هذا القسم، نقوم بعرضه
        if (filteredChannels.length > 0) {
            const catTitle = document.createElement('div');
            catTitle.className = 'category-title';
            catTitle.innerText = cat.name;
            rowsContainer.appendChild(catTitle);

            const grid = document.createElement('div');
            grid.className = 'channels-grid';

            filteredChannels.forEach((channel) => {
                const box = document.createElement('div');
                box.className = 'channel-box';
                
                const isFav = favorites.includes(channel.key);

                box.innerHTML = `
                    <div class="heart-icon ${isFav ? 'is-favorite' : ''}" data-key="${channel.key}">💙</div>
                    <div class="channel-icon-wrapper" style="background-image: url('${channel.logo}')"></div>
                    <div class="channel-box-title">${channel.name}</div>
                `;

                // الضغط على القلب لتفعيل وإلغاء المفضلة دون فتح القناة
                const heart = box.querySelector('.heart-icon');
                heart.addEventListener('click', (e) => {
                    e.stopPropagation(); // منع انتقال الحدث لفتح القناة
                    toggleFavorite(channel.key);
                });

                // الضغط على القناة لفتح صفحة المشغل المستقلة
                box.addEventListener('click', () => {
                    const encodedName = encodeURIComponent(channel.name);
                    const encodedUrl = encodeURIComponent(channel.url);
                    window.location.href = `player.html?name=${encodedName}&url=${encodedUrl}`;
                });

                grid.appendChild(box);
            });

            rowsContainer.appendChild(grid);
        }
    });

    if (rowsContainer.innerHTML === '') {
        rowsContainer.innerHTML = `<p style="text-align:center; color:#888; margin-top:40px;">لا توجد قنوات تطابق بحثك أو مفضلتك حالياً.</p>`;
    }
}

// 💙 5. دالة إضافة/إزالة المفضلة من الجهاز
function toggleFavorite(chKey) {
    if (favorites.includes(chKey)) {
        favorites = favorites.filter(key => key !== chKey);
    } else {
        favorites.push(chKey);
    }
    localStorage.setItem('kurd_stream_favs', JSON.stringify(favorites));
    renderUI(); // إعادة رسم التغيير على الفور
}

// 🔍 6. الاستماع لحدث الكتابة في حقل البحث
searchInput.addEventListener('input', renderUI);

// ⭐ 7. الاستماع لزر تصفية المفضلة فقط
filterFavBtn.addEventListener('click', () => {
    showOnlyFavorites = !showOnlyFavorites;
    filterFavBtn.style.background = showOnlyFavorites ? 'var(--accent-blue)' : 'none';
    filterFavBtn.style.color = showOnlyFavorites ? '#fff' : 'var(--text-color)';
    renderUI();
});
