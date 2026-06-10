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
const auth = firebase.auth();

// تفعيل الواجهات حسب تسجيل الدخول
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('adminPanelBox').style.display = 'block';
        loadCategories();
        loadAdminChannels();
    } else {
        document.getElementById('loginBox').style.display = 'block';
        document.getElementById('adminPanelBox').style.display = 'none';
    }
});

// تسجيل الدخول
document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    auth.signInWithEmailAndPassword(document.getElementById('adminEmail').value, document.getElementById('adminPassword').value)
        .catch(err => alert("خطأ في البيانات"));
});

document.getElementById('adminLogoutBtn').addEventListener('click', () => auth.signOut());

// 📁 1. إضافة قسم جديد لقاعدة البيانات
document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const catName = document.getElementById('catName').value;
    // حفظ باسم مفرس لسهولة التعامل (بدون فراغات)
    const catId = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    database.ref('categories/' + catId).set({
        name: catName
    }).then(() => {
        document.getElementById('addCategoryForm').reset();
        alert('تم إضافة القسم الجديد!');
    });
});

// 📁 2. جلب الأقسام وعرضها وحذفها وتحديث القائمة المنسدلة للخيارات
function loadCategories() {
    database.ref('categories').on('value', (snapshot) => {
        const selectHasCat = document.getElementById('chCategory');
        const listContainer = document.getElementById('adminCategoriesList');
        
        selectHasCat.innerHTML = '';
        listContainer.innerHTML = '';

        snapshot.forEach((child) => {
            const catId = child.key;
            const catData = child.val();

            // إضافة للخيارات داخل فورم القنوات
            let option = document.createElement('option');
            option.value = catId;
            option.innerText = catData.name;
            selectHasCat.appendChild(option);

            // إضافة لقائمة الحذف بالأدمن
            let item = document.createElement('div');
            item.className = 'adm-item';
            item.innerHTML = `<span>📁 ${catData.name}</span> <button onclick="deleteCategory('${catId}')" style="background:#ff3333; padding:2px 6px;">حذف</button>`;
            listContainer.appendChild(item);
        });
    });
}

window.deleteCategory = function(catId) {
    if(confirm("هل تريد حذف هذا القسم؟ سيختفي من واجهة المستخدم أيضاً.")) {
        database.ref('categories/' + catId).remove();
    }
}

// 📺 3. إضافة قناة جديدة تحتوي على اسم، رابط بث، ورابط الصورة
document.getElementById('addChannelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('chName').value;
    const url = document.getElementById('chUrl').value;
    const logo = document.getElementById('chLogo').value;
    const category = document.getElementById('chCategory').value;

    database.ref('channels').push({
        name: name, url: url, logo: logo, category: category
    }).then(() => {
        document.getElementById('addChannelForm').reset();
        alert('تمت إضافة القناة مع صورتها بنجاح!');
    });
});

// جلب القنوات في صفحة الأدمن
function loadAdminChannels() {
    database.ref('channels').on('value', (snapshot) => {
        const adminChannelsList = document.getElementById('adminChannelsList');
        adminChannelsList.innerHTML = '';
        snapshot.forEach((child) => {
            const data = child.val();
            const key = child.key;
            let item = document.createElement('div');
            item.className = 'adm-item';
            item.innerHTML = `<span>📺 ${data.name} (في قسم: ${data.category})</span><button onclick="deleteChannel('${key}')">Delete</button>`;
            adminChannelsList.appendChild(item);
        });
    });
}

window.deleteChannel = function(key) {
    if(confirm("حذف القناة؟")) database.ref('channels/').child(key).remove();
}
