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
const auth = firebase.auth();

const loginBox = document.getElementById('loginBox');
const adminPanelBox = document.getElementById('adminPanelBox');

// 🔐 فحص الحماية الذكي لمنع الطرد عند تسجيل الدخول
auth.onAuthStateChanged((user) => {
    const urlParams = new URLSearchParams(window.location.search);
    const secretKey = urlParams.get('key');
    const MY_SECRET_TOKEN = "Xcfo2026"; // الكود السري الخاص بك

    if (user) {
        // إذا كان المستخدم مسجل دخوله مسبقاً (الأدمن الحقيقي)، نفتح اللوحة فوراً ونخفي صندوق الدخول
        loginBox.style.display = 'none';
        adminPanelBox.style.display = 'block';
        loadCategories();
        loadAdminChannels();
    } else {
        // إذا لم يكن مسجل دخول، نتحقق هل يملك الكود السري في الرابط؟
        if (secretKey === MY_SECRET_TOKEN) {
            // الكود صحيح، نسمح له برؤية واجهة تسجيل الدخول ليضع حسابه الباسورد
            loginBox.style.display = 'block';
            adminPanelBox.style.display = 'none';
        } else {
            // ليس مسجل دخول ولا يملك الكود السري؟ طرد فوري!
            window.location.replace("browse.html");
        }
    }
});

// 🔑 معالجة تسجيل الدخول للأدمن
document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("مرحباً بك مجدداً أيها المالك!");
        })
        .catch(err => alert("خطأ في البريد الإلكتروني أو كلمة المرور الخاصة بالمالك."));
});

// 🚪 تسجيل الخروج
document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.replace("browse.html"); // عند الخروج يتم طرده للصفحة الرئيسية مباشرة
    });
});

// 📁 إدارة الأقسام (إضافة وجلب وحذف)
document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const catName = document.getElementById('catName').value;
    const catId = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    database.ref('categories/' + catId).set({ name: catName })
        .then(() => {
            document.getElementById('addCategoryForm').reset();
        });
});

function loadCategories() {
    database.ref('categories').on('value', (snapshot) => {
        const selectHasCat = document.getElementById('chCategory');
        const listContainer = document.getElementById('adminCategoriesList');
        selectHasCat.innerHTML = '';
        listContainer.innerHTML = '';

        snapshot.forEach((child) => {
            const catId = child.key;
            const catData = child.val();

            let option = document.createElement('option');
            option.value = catId;
            option.innerText = catData.name;
            selectHasCat.appendChild(option);

            let item = document.createElement('div');
            item.className = 'adm-item';
            item.innerHTML = `<span>📁 ${catData.name}</span> <button onclick="deleteCategory('${catId}')" style="background:#ff3333; padding:2px 6px; border:none; color:#fff; border-radius:4px; cursor:pointer;">حذف</button>`;
            listContainer.appendChild(item);
        });
    });
}

window.deleteCategory = function(catId) {
    if(confirm("هل تريد حذف هذا القسم؟")) database.ref('categories/' + catId).remove();
}

// 📺 إدارة القنوات
document.getElementById('addChannelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('chName').value;
    const url = document.getElementById('chUrl').value;
    const logo = document.getElementById('chLogo').value;
    const category = document.getElementById('chCategory').value;

    database.ref('channels').push({ name: name, url: url, logo: logo, category: category })
        .then(() => {
            document.getElementById('addChannelForm').reset();
            alert('تمت إضافة القناة بنجاح!');
        });
});

function loadAdminChannels() {
    database.ref('channels').on('value', (snapshot) => {
        const adminChannelsList = document.getElementById('adminChannelsList');
        adminChannelsList.innerHTML = '';
        snapshot.forEach((child) => {
            const data = child.val();
            const key = child.key;
            let item = document.createElement('div');
            item.className = 'adm-item';
            item.innerHTML = `<span>📺 ${data.name}</span> <button onclick="deleteChannel('${key}')" style="background:#ff3333; padding:2px 6px; border:none; color:#fff; border-radius:4px; cursor:pointer;">حذف</button>`;
            adminChannelsList.appendChild(item);
        });
    });
}

window.deleteChannel = function(key) {
    if(confirm("حذف القناة؟")) database.ref('channels/').child(key).remove();
}
