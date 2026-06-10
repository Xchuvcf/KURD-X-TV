const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const rowsContainer = document.getElementById('dynamicRowsContainer');
const mainPlayer = document.getElementById('mainPlayer');
const heroTitle = document.getElementById('heroTitle');

// دالة جلب البيانات وعرضها بأسلوب نتفليكس الديناميكي المطور
database.ref('categories').on('value', (categoriesSnapshot) => {
    rowsContainer.innerHTML = ''; // تفريغ الواجهة لإعادة البناء عند أي تحديث

    categoriesSnapshot.forEach((catChild) => {
        const catId = catChild.key;
        const catData = catChild.val();

        // 1. إنشاء السطر الخاص بالقسم (Row)
        const rowWrapper = document.createElement('div');
        rowWrapper.className = 'category-row';
        rowWrapper.innerHTML = `<h2>${catData.name}</h2>`;

        const slider = document.createElement('div');
        slider.className = 'channels-slider';
        slider.id = `slider-${catId}`;

        rowWrapper.appendChild(slider);
        rowsContainer.appendChild(rowWrapper);

        // 2. جلب القنوات التابعة لهذا القسم فقط وعرض صورتها كخلفية للبطاقة
        database.ref('channels').orderByChild('category').equalTo(catId).once('value', (channelsSnapshot) => {
            slider.innerHTML = '';
            
            if(!channelsSnapshot.exists()) {
                slider.innerHTML = `<p style="color:#666; font-size:0.9rem; padding-left:10px;">No channels in this category yet.</p>`;
            }

            channelsSnapshot.forEach((chChild) => {
                const channel = chChild.val();

                // بناء بطاقة القناة بصورتها
                const card = document.createElement('div');
                card.className = 'channel-card';
                card.style.backgroundImage = `url('${channel.logo}')`; // هنا يتم تعيين صورة القناة المضافة من الأدمن
                card.innerHTML = `<div class="channel-title">${channel.name}</div>`;

                // عند الضغط يتم تشغيل القناة في المشغل العلوي للموقع
                card.onclick = () => {
                    playChannel(channel.url, channel.name);
                };

                slider.appendChild(card);
            });
        });
    });
});

function playChannel(url, name) {
    heroTitle.innerText = name;
    mainPlayer.src = url;
    mainPlayer.muted = false;
    mainPlayer.play().catch(e => console.log("Click to play video."));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// إظهار زر الأدمن للمطور في الهيدر إذا كان مسجلاً للدخول
firebase.auth().onAuthStateChanged((user) => {
    document.getElementById('adminLink').style.display = user ? 'block' : 'none';
});
