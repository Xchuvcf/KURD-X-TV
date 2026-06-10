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

// جلب الأقسام والقنوات معاً من Firebase
database.ref('categories').on('value', (categoriesSnapshot) => {
    rowsContainer.innerHTML = '';

    categoriesSnapshot.forEach((catChild) => {
        const catId = catChild.key;
        const catData = catChild.val();

        // عنوان القسم
        const catTitle = document.createElement('div');
        catTitle.className = 'category-title';
        catTitle.innerText = catData.name;
        rowsContainer.appendChild(catTitle);

        // شبكة القنوات (Grid)
        const grid = document.createElement('div');
        grid.className = 'channels-grid';
        grid.id = `grid-${catId}`;
        rowsContainer.appendChild(grid);

        // جلب القنوات لهذا القسم
        database.ref('channels').orderByChild('category').equalTo(catId).once('value', (channelsSnapshot) => {
            grid.innerHTML = '';
            
            channelsSnapshot.forEach((chChild) => {
                const channel = chChild.val();

                // بناء بطاقة الهاتف المماثلة للصورة تماماً
                const box = document.createElement('div');
                box.className = 'channel-box';
                
                box.innerHTML = `
                    <div class="heart-icon active">💙</div>
                    <div class="channel-icon-wrapper" style="background-image: url('${channel.logo}')"></div>
                    <div class="channel-box-title">${channel.name}</div>
                `;

                // حدث الانتقال لصفحة المشغل المنفصلة الخاصة بالقناة
                box.onclick = () => {
                    const encodedName = encodeURIComponent(channel.name);
                    const encodedUrl = encodeURIComponent(channel.url);
                    // فتح صفحة مستقلة وتمرير البيانات في الرابط
                    window.location.href = `player.html?name=${encodedName}&url=${encodedUrl}`;
                };

                grid.appendChild(box);
            });
        });
    });
});
